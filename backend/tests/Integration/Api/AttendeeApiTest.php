<?php

namespace App\Tests\Integration\Api;

use App\Tests\Integration\ApiTestCase;

class AttendeeApiTest extends ApiTestCase
{
    // ── Registration (public) ─────────────────────────────────────────────────

    public function testRegisterAttendeeWithoutTokenReturns201(): void
    {
        $this->jsonRequest('POST', '/api/attendees', [
            'first_name' => 'Alice',
            'last_name' => 'Martin',
            'address' => '12 rue de la Paix, Paris',
            'email' => 'alice@test.com',
            'deposit' => 100.0,
            'breakfast' => false,
            'plainPassword' => 'Alice1234!',
        ]);

        $data = $this->assertJsonResponse(201);
        $this->assertSame('Alice', $data['first_name']);
        $this->assertSame('alice@test.com', $data['email']);
        $this->assertArrayNotHasKey('password', $data);
        $this->assertArrayNotHasKey('plainPassword', $data);
    }

    public function testRegisterAttendeeWithMissingRequiredFieldReturns422(): void
    {
        $this->jsonRequest('POST', '/api/attendees', [
            'last_name' => 'Martin',
            'email' => 'alice@test.com',
            'deposit' => 0.0,
            'breakfast' => false,
            // missing first_name and address
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testRegisterAttendeeWithInvalidEmailReturns422(): void
    {
        $this->jsonRequest('POST', '/api/attendees', [
            'first_name' => 'Alice',
            'last_name' => 'Martin',
            'address' => '12 rue Test',
            'email' => 'not-an-email',
            'deposit' => 0.0,
            'breakfast' => false,
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    // ── Read (authenticated) ──────────────────────────────────────────────────

    public function testGetAttendeesWithoutTokenReturns401(): void
    {
        $this->jsonRequest('GET', '/api/attendees');

        $this->assertResponseStatusCodeSame(401);
    }

    public function testGetAttendeesWithUserTokenReturns403(): void
    {
        $this->createAttendee('user@test.com', 'password123');
        $token = $this->getToken('user@test.com', 'password123');

        $this->jsonRequest('GET', '/api/attendees', [], $token);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetAttendeesWithAdminTokenReturns200(): void
    {
        $this->createAttendee('admin@test.com', 'admin123', ['ROLE_ADMIN']);
        $token = $this->getToken('admin@test.com', 'admin123');

        $this->jsonRequest('GET', '/api/attendees', [], $token);

        $data = $this->assertJsonResponse(200);
        $this->assertArrayHasKey('member', $data);
    }

    public function testGetSingleAttendeeWithTokenReturns200(): void
    {
        $attendee = $this->createAttendee('user@test.com', 'password123');
        $token = $this->getToken('user@test.com', 'password123');

        $this->jsonRequest('GET', '/api/attendees/'.$attendee->getId(), [], $token);

        $data = $this->assertJsonResponse(200);
        $this->assertSame('user@test.com', $data['email']);
    }

    // ── Admin operations ──────────────────────────────────────────────────────

    public function testDeleteAttendeeWithAdminTokenReturns204(): void
    {
        $this->createAttendee('admin@test.com', 'admin123', ['ROLE_ADMIN']);
        $target = $this->createAttendee('target@test.com', 'password123');
        $token = $this->getToken('admin@test.com', 'admin123');

        $this->jsonRequest('DELETE', '/api/attendees/'.$target->getId(), [], $token);

        $this->assertResponseStatusCodeSame(204);
    }

    public function testDeleteAttendeeWithUserTokenReturns403(): void
    {
        $this->createAttendee('user@test.com', 'password123');
        $target = $this->createAttendee('target@test.com', 'password123');
        $token = $this->getToken('user@test.com', 'password123');

        $this->jsonRequest('DELETE', '/api/attendees/'.$target->getId(), [], $token);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testPatchAttendeeWithAdminTokenReturns200(): void
    {
        $this->createAttendee('admin@test.com', 'admin123', ['ROLE_ADMIN']);
        $target = $this->createAttendee('target@test.com', 'password123');
        $token = $this->getToken('admin@test.com', 'admin123');

        $this->jsonRequest('PATCH', '/api/attendees/'.$target->getId(), [
            'first_name' => 'Updated',
        ], $token);

        $data = $this->assertJsonResponse(200);
        $this->assertSame('Updated', $data['first_name']);
    }

    // ── Filters ───────────────────────────────────────────────────────────────

    public function testSearchFilterByEmailReturnsMatchingAttendee(): void
    {
        $this->createAttendee('alice@test.com', 'password123', [], 'Alice', 'Martin');
        $this->createAttendee('bob@test.com', 'password123', [], 'Bob', 'Dupont');
        $this->createAttendee('admin@test.com', 'admin123', ['ROLE_ADMIN']);
        $token = $this->getToken('admin@test.com', 'admin123');

        $this->jsonRequest('GET', '/api/attendees?email=alice@test.com', [], $token);

        $data = $this->assertJsonResponse(200);
        $this->assertCount(1, $data['member']);
        $this->assertSame('alice@test.com', $data['member'][0]['email']);
    }
}
