<?php

namespace App\Controller;

use App\Entity\Attendee;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/me', name: 'api_me', methods: ['GET'])]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class MeController extends AbstractController
{
    public function __construct(private SerializerInterface $serializer) {}

    public function __invoke(): JsonResponse
    {
        /** @var Attendee $user */
        $user = $this->getUser();

        $json = $this->serializer->serialize($user, 'json', [
            'groups' => ['attendee:read'],
        ]);

        return new JsonResponse($json, 200, [], true);
    }
}
