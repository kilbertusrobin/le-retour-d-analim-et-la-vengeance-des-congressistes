<?php

namespace App\Tests\Integration;

use App\Entity\Attendee;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

abstract class ApiTestCase extends WebTestCase
{
    protected KernelBrowser $client;
    protected EntityManagerInterface $em;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();
        $this->em = static::getContainer()->get('doctrine.orm.entity_manager');

        $schemaTool = new SchemaTool($this->em);
        $metadata = $this->em->getMetadataFactory()->getAllMetadata();
        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->em->close();
    }

    protected function createAttendee(
        string $email,
        string $password,
        array $roles = [],
        string $firstName = 'Test',
        string $lastName = 'User'
    ): Attendee {
        $hasher = static::getContainer()->get(UserPasswordHasherInterface::class);

        $attendee = (new Attendee())
            ->setEmail($email)
            ->setFirstName($firstName)
            ->setLastName($lastName)
            ->setAddress('1 rue Test')
            ->setDeposit(0.0)
            ->setBreakfast(false)
            ->setRoles($roles)
            ->setPassword($hasher->hashPassword(new Attendee(), $password));

        $this->em->persist($attendee);
        $this->em->flush();

        return $attendee;
    }

    protected function getToken(string $email, string $password): string
    {
        $this->client->request(
            'POST',
            '/api/auth',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'password' => $password])
        );

        $data = json_decode($this->client->getResponse()->getContent(), true);
        return $data['token'] ?? '';
    }

    protected function jsonRequest(string $method, string $uri, array $data = [], string $token = ''): void
    {
        // /api/auth uses Symfony json_login → plain application/json
        // API Platform resources require application/ld+json (POST/PUT) or application/merge-patch+json (PATCH)
        if (str_ends_with($uri, '/auth')) {
            $contentType = 'application/json';
        } elseif ($method === 'PATCH') {
            $contentType = 'application/merge-patch+json';
        } else {
            $contentType = 'application/ld+json';
        }

        $headers = [
            'CONTENT_TYPE' => $contentType,
            'HTTP_ACCEPT'  => 'application/ld+json',
        ];

        if ($token !== '') {
            $headers['HTTP_AUTHORIZATION'] = 'Bearer '.$token;
        }

        $body = $data ? json_encode($data) : ($method === 'PATCH' ? '{}' : null);
        $this->client->request($method, $uri, [], [], $headers, $body);
    }

    protected function assertJsonResponse(int $statusCode): array
    {
        $this->assertResponseStatusCodeSame($statusCode);
        return json_decode($this->client->getResponse()->getContent(), true) ?? [];
    }
}
