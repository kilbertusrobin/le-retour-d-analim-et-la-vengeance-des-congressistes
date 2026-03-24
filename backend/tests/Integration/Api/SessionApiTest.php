<?php

namespace App\Tests\Integration\Api;

use App\Tests\Integration\ApiTestCase;

class SessionApiTest extends ApiTestCase
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
            'label'              => 'Session PHP avancé',
            'start_date'         => '2026-09-01T08:00:00',
            'duration_half_days' => 4,
            'price'              => 300,
        ];
    }

    // ── GET collection ────────────────────────────────────────────────────────

    public function testGetSessionsWithTokenReturns200(): void
    {
        $this->jsonRequest('GET', '/api/sessions', [], $this->userToken);
        $data = $this->assertJsonResponse(200);
        $this->assertArrayHasKey('member', $data);
    }

    public function testGetSessionsWithoutTokenReturns401(): void
    {
        $this->jsonRequest('GET', '/api/sessions');
        $this->assertResponseStatusCodeSame(401);
    }

    // ── POST ──────────────────────────────────────────────────────────────────

    public function testCreateSessionWithAdminReturns201(): void
    {
        $this->jsonRequest('POST', '/api/sessions', $this->validPayload(), $this->adminToken);

        $data = $this->assertJsonResponse(201);
        $this->assertSame('Session PHP avancé', $data['label']);
        $this->assertSame(300, $data['price']);
        $this->assertSame(4, $data['duration_half_days']);
    }

    public function testCreateSessionWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/sessions', $this->validPayload(), $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testCreateSessionWithoutTokenReturns401(): void
    {
        $this->jsonRequest('POST', '/api/sessions', $this->validPayload());
        $this->assertResponseStatusCodeSame(401);
    }

    public function testCreateSessionWithMissingLabelReturns422(): void
    {
        $payload = $this->validPayload();
        unset($payload['label']);
        $this->jsonRequest('POST', '/api/sessions', $payload, $this->adminToken);
        $this->assertResponseStatusCodeSame(422);
    }

    public function testCreateSessionWithNegativePriceReturns422(): void
    {
        $payload = $this->validPayload();
        $payload['price'] = -100;
        $this->jsonRequest('POST', '/api/sessions', $payload, $this->adminToken);
        $this->assertResponseStatusCodeSame(422);
    }

    // ── GET single ────────────────────────────────────────────────────────────

    public function testGetSingleSessionReturns200(): void
    {
        $this->jsonRequest('POST', '/api/sessions', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('GET', '/api/sessions/'.$created['id'], [], $this->userToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('Session PHP avancé', $data['label']);
    }

    // ── PATCH ─────────────────────────────────────────────────────────────────

    public function testPatchSessionWithAdminReturns200(): void
    {
        $this->jsonRequest('POST', '/api/sessions', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('PATCH', '/api/sessions/'.$created['id'], ['label' => 'Session mise à jour'], $this->adminToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('Session mise à jour', $data['label']);
    }

    public function testPatchSessionWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/sessions', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('PATCH', '/api/sessions/'.$created['id'], ['label' => 'Hack'], $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }

    // ── PUT ───────────────────────────────────────────────────────────────────

    public function testPutSessionWithAdminReturns200(): void
    {
        $this->jsonRequest('POST', '/api/sessions', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $updated = array_merge($this->validPayload(), ['label' => 'Session complète', 'price' => 450]);
        $this->jsonRequest('PUT', '/api/sessions/'.$created['id'], $updated, $this->adminToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('Session complète', $data['label']);
        $this->assertSame(450, $data['price']);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    public function testDeleteSessionWithAdminReturns204(): void
    {
        $this->jsonRequest('POST', '/api/sessions', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('DELETE', '/api/sessions/'.$created['id'], [], $this->adminToken);
        $this->assertResponseStatusCodeSame(204);
    }

    public function testDeleteSessionWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/sessions', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('DELETE', '/api/sessions/'.$created['id'], [], $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }
}
