<?php

namespace App\Tests\Integration\Api;

use App\Tests\Integration\ApiTestCase;

class PayerOrganizationApiTest extends ApiTestCase
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
            'name'    => 'Pôle Emploi',
            'address' => '15 avenue du Travail, Lyon',
        ];
    }

    // ── GET collection ────────────────────────────────────────────────────────

    public function testGetOrganizationsWithTokenReturns200(): void
    {
        $this->jsonRequest('GET', '/api/payer_organizations', [], $this->userToken);
        $data = $this->assertJsonResponse(200);
        $this->assertArrayHasKey('member', $data);
    }

    public function testGetOrganizationsWithoutTokenReturns401(): void
    {
        $this->jsonRequest('GET', '/api/payer_organizations');
        $this->assertResponseStatusCodeSame(401);
    }

    // ── POST ──────────────────────────────────────────────────────────────────

    public function testCreateOrganizationWithAdminReturns201(): void
    {
        $this->jsonRequest('POST', '/api/payer_organizations', $this->validPayload(), $this->adminToken);

        $data = $this->assertJsonResponse(201);
        $this->assertSame('Pôle Emploi', $data['name']);
        $this->assertSame('15 avenue du Travail, Lyon', $data['address']);
    }

    public function testCreateOrganizationWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/payer_organizations', $this->validPayload(), $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testCreateOrganizationWithoutTokenReturns401(): void
    {
        $this->jsonRequest('POST', '/api/payer_organizations', $this->validPayload());
        $this->assertResponseStatusCodeSame(401);
    }

    public function testCreateOrganizationWithMissingNameReturns422(): void
    {
        $payload = $this->validPayload();
        unset($payload['name']);
        $this->jsonRequest('POST', '/api/payer_organizations', $payload, $this->adminToken);
        $this->assertResponseStatusCodeSame(422);
    }

    public function testCreateOrganizationWithMissingAddressReturns422(): void
    {
        $payload = $this->validPayload();
        unset($payload['address']);
        $this->jsonRequest('POST', '/api/payer_organizations', $payload, $this->adminToken);
        $this->assertResponseStatusCodeSame(422);
    }

    // ── GET single ────────────────────────────────────────────────────────────

    public function testGetSingleOrganizationReturns200(): void
    {
        $this->jsonRequest('POST', '/api/payer_organizations', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('GET', '/api/payer_organizations/'.$created['id'], [], $this->userToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('Pôle Emploi', $data['name']);
    }

    // ── PATCH ─────────────────────────────────────────────────────────────────

    public function testPatchOrganizationWithAdminReturns200(): void
    {
        $this->jsonRequest('POST', '/api/payer_organizations', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('PATCH', '/api/payer_organizations/'.$created['id'], ['name' => 'OPCO Santé'], $this->adminToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('OPCO Santé', $data['name']);
    }

    public function testPatchOrganizationWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/payer_organizations', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('PATCH', '/api/payer_organizations/'.$created['id'], ['name' => 'Hack'], $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }

    // ── PUT ───────────────────────────────────────────────────────────────────

    public function testPutOrganizationWithAdminReturns200(): void
    {
        $this->jsonRequest('POST', '/api/payer_organizations', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $updated = ['name' => 'AFDAS', 'address' => '32 rue des Arts, Paris'];
        $this->jsonRequest('PUT', '/api/payer_organizations/'.$created['id'], $updated, $this->adminToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('AFDAS', $data['name']);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    public function testDeleteOrganizationWithAdminReturns204(): void
    {
        $this->jsonRequest('POST', '/api/payer_organizations', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('DELETE', '/api/payer_organizations/'.$created['id'], [], $this->adminToken);
        $this->assertResponseStatusCodeSame(204);
    }

    public function testDeleteOrganizationWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/payer_organizations', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('DELETE', '/api/payer_organizations/'.$created['id'], [], $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }
}
