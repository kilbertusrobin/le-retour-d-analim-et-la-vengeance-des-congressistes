<?php

namespace App\Tests\Integration\Api;

use App\Tests\Integration\ApiTestCase;

class AuthApiTest extends ApiTestCase
{
    public function testLoginWithValidCredentialsReturnsToken(): void
    {
        $this->createAttendee('user@test.com', 'password123');

        $this->jsonRequest('POST', '/api/auth', [
            'email' => 'user@test.com',
            'password' => 'password123',
        ]);

        $data = $this->assertJsonResponse(200);
        $this->assertArrayHasKey('token', $data);
        $this->assertNotEmpty($data['token']);
    }

    public function testLoginWithWrongPasswordReturns401(): void
    {
        $this->createAttendee('user@test.com', 'correctpassword');

        $this->jsonRequest('POST', '/api/auth', [
            'email' => 'user@test.com',
            'password' => 'wrongpassword',
        ]);

        $this->assertResponseStatusCodeSame(401);
    }

    public function testLoginWithUnknownEmailReturns401(): void
    {
        $this->jsonRequest('POST', '/api/auth', [
            'email' => 'nobody@test.com',
            'password' => 'password123',
        ]);

        $this->assertResponseStatusCodeSame(401);
    }

    public function testLoginWithMissingFieldsReturnsBadRequest(): void
    {
        $this->jsonRequest('POST', '/api/auth', ['email' => 'user@test.com']);

        // Symfony JsonLoginAuthenticator throws 400 when password key is missing
        $this->assertResponseStatusCodeSame(400);
    }
}
