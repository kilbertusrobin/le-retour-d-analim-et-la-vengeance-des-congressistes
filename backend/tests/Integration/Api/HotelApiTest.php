<?php

namespace App\Tests\Integration\Api;

use App\Tests\Integration\ApiTestCase;

class HotelApiTest extends ApiTestCase
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
            'name'            => 'Ibis Centre',
            'address'         => '10 rue de la Gare',
            'category'        => '3*',
            'night_price'     => 80.0,
            'breakfast_price' => 12.0,
        ];
    }

    // ── GET collection ────────────────────────────────────────────────────────

    public function testGetHotelsWithTokenReturns200(): void
    {
        $this->jsonRequest('GET', '/api/hotels', [], $this->userToken);
        $data = $this->assertJsonResponse(200);
        $this->assertArrayHasKey('member', $data);
    }

    public function testGetHotelsWithoutTokenReturns401(): void
    {
        $this->jsonRequest('GET', '/api/hotels');
        $this->assertResponseStatusCodeSame(401);
    }

    // ── POST ──────────────────────────────────────────────────────────────────

    public function testCreateHotelWithAdminReturns201(): void
    {
        $this->jsonRequest('POST', '/api/hotels', $this->validPayload(), $this->adminToken);

        $data = $this->assertJsonResponse(201);
        $this->assertSame('Ibis Centre', $data['name']);
        $this->assertEquals(80.0, $data['night_price']);
        $this->assertSame('3*', $data['category']);
    }

    public function testCreateHotelWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/hotels', $this->validPayload(), $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testCreateHotelWithoutTokenReturns401(): void
    {
        $this->jsonRequest('POST', '/api/hotels', $this->validPayload());
        $this->assertResponseStatusCodeSame(401);
    }

    public function testCreateHotelWithMissingNameReturns422(): void
    {
        $payload = $this->validPayload();
        unset($payload['name']);
        $this->jsonRequest('POST', '/api/hotels', $payload, $this->adminToken);
        $this->assertResponseStatusCodeSame(422);
    }

    public function testCreateHotelWithNegativeNightPriceReturns422(): void
    {
        $payload = $this->validPayload();
        $payload['night_price'] = -5.0;
        $this->jsonRequest('POST', '/api/hotels', $payload, $this->adminToken);
        $this->assertResponseStatusCodeSame(422);
    }

    // ── GET single ────────────────────────────────────────────────────────────

    public function testGetSingleHotelReturns200(): void
    {
        $this->jsonRequest('POST', '/api/hotels', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('GET', '/api/hotels/'.$created['id'], [], $this->userToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('Ibis Centre', $data['name']);
    }

    // ── PATCH ─────────────────────────────────────────────────────────────────

    public function testPatchHotelWithAdminReturns200(): void
    {
        $this->jsonRequest('POST', '/api/hotels', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('PATCH', '/api/hotels/'.$created['id'], ['name' => 'Novotel'], $this->adminToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('Novotel', $data['name']);
    }

    public function testPatchHotelWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/hotels', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('PATCH', '/api/hotels/'.$created['id'], ['name' => 'Hack'], $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }

    // ── PUT ───────────────────────────────────────────────────────────────────

    public function testPutHotelWithAdminReturns200(): void
    {
        $this->jsonRequest('POST', '/api/hotels', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $updated = array_merge($this->validPayload(), ['name' => 'Mercure', 'night_price' => 95.0]);
        $this->jsonRequest('PUT', '/api/hotels/'.$created['id'], $updated, $this->adminToken);
        $data = $this->assertJsonResponse(200);
        $this->assertSame('Mercure', $data['name']);
        $this->assertEquals(95.0, $data['night_price']);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    public function testDeleteHotelWithAdminReturns204(): void
    {
        $this->jsonRequest('POST', '/api/hotels', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('DELETE', '/api/hotels/'.$created['id'], [], $this->adminToken);
        $this->assertResponseStatusCodeSame(204);
    }

    public function testDeleteHotelWithUserReturns403(): void
    {
        $this->jsonRequest('POST', '/api/hotels', $this->validPayload(), $this->adminToken);
        $created = $this->assertJsonResponse(201);

        $this->jsonRequest('DELETE', '/api/hotels/'.$created['id'], [], $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }
}
