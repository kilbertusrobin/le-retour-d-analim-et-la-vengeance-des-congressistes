<?php

namespace App\Tests\Integration\Api;

use App\Entity\Attendee;
use App\Entity\Invoice;
use App\Tests\Integration\ApiTestCase;

class InvoiceApiTest extends ApiTestCase
{
    private string $adminToken;
    private string $userToken;
    private Attendee $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAttendee('admin@test.com', 'admin123', ['ROLE_ADMIN']);
        $this->adminToken = $this->getToken('admin@test.com', 'admin123');

        $this->createAttendee('user@test.com', 'user123');
        $this->userToken = $this->getToken('user@test.com', 'user123');
    }

    public function testCreateInvoiceWithAdminReturns201(): void
    {
        $attendee = $this->createAttendee('bob@test.com', 'password123');

        $this->jsonRequest('POST', '/api/invoices', [
            'attendee' => '/api/attendees/'.$attendee->getId(),
        ], $this->adminToken);

        $data = $this->assertJsonResponse(201);
        $this->assertFalse($data['print']);
        $this->assertFalse($data['settled']);
        $this->assertNotNull($data['creation_date']);
        $this->assertArrayHasKey('total_amount', $data);
    }

    public function testCreateInvoiceWithUserReturns403(): void
    {
        $attendee = $this->createAttendee('bob@test.com', 'password123');

        $this->jsonRequest('POST', '/api/invoices', [
            'attendee' => '/api/attendees/'.$attendee->getId(),
        ], $this->userToken);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testCreateDuplicateInvoiceReturns409(): void
    {
        $attendee = $this->createAttendee('bob@test.com', 'password123');

        // First invoice
        $this->jsonRequest('POST', '/api/invoices', [
            'attendee' => '/api/attendees/'.$attendee->getId(),
        ], $this->adminToken);
        $this->assertResponseStatusCodeSame(201);

        // Second invoice for same attendee
        $this->em->clear();
        $this->jsonRequest('POST', '/api/invoices', [
            'attendee' => '/api/attendees/'.$attendee->getId(),
        ], $this->adminToken);

        $this->assertResponseStatusCodeSame(409);
    }

    public function testMarkInvoicePrintedSetsPrintTrue(): void
    {
        $attendee = $this->createAttendee('bob@test.com', 'password123');
        $this->jsonRequest('POST', '/api/invoices', [
            'attendee' => '/api/attendees/'.$attendee->getId(),
        ], $this->adminToken);
        $this->assertResponseStatusCodeSame(201);
        $created = json_decode($this->client->getResponse()->getContent(), true);
        $invoiceId = $created['id'];
        $this->assertNotNull($invoiceId, 'Invoice ID should not be null after creation');

        $this->jsonRequest('PATCH', "/api/invoices/{$invoiceId}/mark-printed", [], $this->adminToken);

        $data = $this->assertJsonResponse(200);
        $this->assertTrue($data['print']);
    }

    public function testGetInvoicesWithUserTokenReturns200(): void
    {
        $this->jsonRequest('GET', '/api/invoices', [], $this->userToken);
        $this->assertResponseStatusCodeSame(200);
    }

    public function testGetInvoicesWithoutTokenReturns401(): void
    {
        $this->jsonRequest('GET', '/api/invoices');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testInvoiceTotalIncludesHotelCost(): void
    {
        // hotel: 65*5=325, no deposit → total=325
        $hotel = new \App\Entity\Hotel();
        $hotel->setName('Ibis')->setAddress('1 rue Test')->setCategory('2*')
              ->setNightPrice(65.0)->setBreakfastPrice(10.0);
        $this->em->persist($hotel);

        $attendee = $this->createAttendee('bob@test.com', 'password123');
        $attendee->setHotel($hotel)->setBreakfast(false)->setDeposit(0.0);
        $this->em->flush();

        $this->jsonRequest('POST', '/api/invoices', [
            'attendee' => '/api/attendees/'.$attendee->getId(),
        ], $this->adminToken);

        $data = $this->assertJsonResponse(201);
        $this->assertEquals(325.0, $data['total_amount']);
    }
}
