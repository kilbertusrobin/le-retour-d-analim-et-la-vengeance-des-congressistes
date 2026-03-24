<?php

namespace App\Tests\Integration\Api;

use App\Tests\Integration\ApiTestCase;

class StatsApiTest extends ApiTestCase
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

    public function testGetStatsWithAdminReturns200(): void
    {
        $this->jsonRequest('GET', '/api/stats', [], $this->adminToken);

        $data = $this->assertJsonResponse(200);
        $this->assertArrayHasKey('attendees', $data);
        $this->assertArrayHasKey('invoices', $data);
        $this->assertArrayHasKey('revenue', $data);
        $this->assertArrayHasKey('sessions', $data);
        $this->assertArrayHasKey('activities', $data);
        $this->assertArrayHasKey('hotels', $data);
    }

    public function testGetStatsWithUserReturns403(): void
    {
        $this->jsonRequest('GET', '/api/stats', [], $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetStatsWithoutTokenReturns401(): void
    {
        $this->jsonRequest('GET', '/api/stats');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testStatsReflectsAttendeeCount(): void
    {
        // 2 attendees already created in setUp (admin + user)
        $this->createAttendee('extra@test.com', 'password123');

        $this->jsonRequest('GET', '/api/stats', [], $this->adminToken);

        $data = $this->assertJsonResponse(200);
        $this->assertSame(3, $data['attendees']['total']);
    }

    public function testStatsInvoiceCountsAreCorrect(): void
    {
        $attendee = $this->createAttendee('bob@test.com', 'password123');
        $this->em->clear();

        // Create an invoice
        $this->jsonRequest('POST', '/api/invoices', [
            'attendee' => '/api/attendees/'.$attendee->getId(),
        ], $this->adminToken);
        $this->assertResponseStatusCodeSame(201, 'Invoice creation failed');

        $this->jsonRequest('GET', '/api/stats', [], $this->adminToken);

        $data = $this->assertJsonResponse(200);
        $this->assertSame(1, $data['invoices']['total']);
        $this->assertSame(0, $data['invoices']['settled']);
        $this->assertSame(1, $data['invoices']['unsettled']);
    }
}
