<?php

namespace App\Tests\Integration\Api;

use App\Tests\Integration\ApiTestCase;

class ActivityApiTest extends ApiTestCase
{
    private string $adminToken;
    private string $userToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAttendee('admin@test.com', 'admin123', ['ROLE_ADMIN']);
        $this->adminToken = $this->getToken('admin@test.com', 'admin123');

        $this->createAttendee('user@test.com', 'user123');
        $this->userToken = $this->getToken('user@test.com', 'user123');
    }

    private function validPayload(): array
    {
        return [
            'label'     => 'Atelier PHP',
            'date_time' => '2026-06-15T09:00:00',
            'price'     => 50,
        ];
    }

    // ── GET collection ────────────────────────────────────────────────────────

    public function testGetActivitiesWithTokenReturns200(): void
    {
        $this->jsonRequest('GET', '/api/activities', [], $this->userToken);
        $data = $this->assertJsonResponse(200);
        $this->assertArrayHasKey('member', $data);
    }

    public function testGetActivitiesWithoutTokenReturns401(): void
    {
        $this->jsonRequest('GET', '/api/activities');
        $this->assertResponseStatusCodeSame(401);
    }

    // ── POST ──────────────────────────────────────────────────────────────────

    public function testCreateActivityWithAdminReturns201(): void
    {
        $this->jsonRequest('POST', '/api/activities', $this->validPayload(), $this->adminToken);

        $data = $this->assertJsonResponse(201);
        $this->assertSame('Atelier PHP', $data['label']);
        $this->assertSame(50, $data['price']);
    }

    public function testCreateActivityWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/activities', $this->validPayload(), $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testCreateActivityWithoutTokenReturns401(): void
    {
        $this->jsonRequest('POST', '/api/activities', $this->validPayload());
        $this->assertResponseStatusCodeSame(401);
    }

    public function testCreateActivityWithMissingLabelReturns422(): void
    {
        $payload = $this->validPayload();
        unset($payload['label']);
        $this->jsonRequest('POST', '/api/activities', $payload, $this->adminToken);
        $this->assertResponseStatusCodeSame(422);
    }

    public function testCreateActivityWithNegativePriceReturns422(): void
    {
        $payload = $this->validPayload();
        $payload['price'] = -10;
        $this->jsonRequest('POST', '/api/activities', $payload, $this->adminToken);
        $this->assertResponseStatusCodeSame(422);
    }

    // ── GET single ────────────────────────────────────────────────────────────

    public function testGetSingleActivityReturns200(): void
    {
        $this->jsonRequest('POST', '/api/activities', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('GET', '/api/activities/'.$created['id'], [], $this->userToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('Atelier PHP', $data['label']);
    }

    // ── PATCH ─────────────────────────────────────────────────────────────────

    public function testPatchActivityWithAdminReturns200(): void
    {
        $this->jsonRequest('POST', '/api/activities', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('PATCH', '/api/activities/'.$created['id'], ['label' => 'Mis à jour'], $this->adminToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('Mis à jour', $data['label']);
    }

    public function testPatchActivityWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/activities', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('PATCH', '/api/activities/'.$created['id'], ['label' => 'Hack'], $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    public function testDeleteActivityWithAdminReturns204(): void
    {
        $this->jsonRequest('POST', '/api/activities', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('DELETE', '/api/activities/'.$created['id'], [], $this->adminToken);
        $this->assertResponseStatusCodeSame(204);
    }

    public function testDeleteActivityWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/activities', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('DELETE', '/api/activities/'.$created['id'], [], $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }
}
