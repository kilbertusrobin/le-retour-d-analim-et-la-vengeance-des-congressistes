<?php

namespace App\Tests\Integration\Api;

use App\Entity\Attendee;
use App\Entity\Invoice;
use App\Tests\Integration\ApiTestCase;

class PaymentApiTest extends ApiTestCase
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

    private function createInvoiceForNewAttendee(string $email): array
    {
        $attendee = $this->createAttendee($email, 'password123');
        $this->em->clear();

        $this->jsonRequest('POST', '/api/invoices', [
            'attendee' => '/api/attendees/'.$attendee->getId(),
        ], $this->adminToken);

        $this->assertResponseStatusCodeSame(201, 'Invoice creation failed for '.$email);
        return json_decode($this->client->getResponse()->getContent(), true);
    }

    public function testCreatePaymentMarksInvoiceAsSettled(): void
    {
        $invoice = $this->createInvoiceForNewAttendee('bob@test.com');

        $this->jsonRequest('POST', '/api/payments', [
            'invoice' => '/api/invoices/'.$invoice['id'],
            'amount' => 150.0,
        ], $this->adminToken);

        $this->assertResponseStatusCodeSame(201);

        // Verify invoice is now settled
        $this->jsonRequest('GET', '/api/invoices/'.$invoice['id'], [], $this->adminToken);
        $updatedInvoice = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertTrue($updatedInvoice['settled']);
    }

    public function testCreatePaymentWithUserReturns403(): void
    {
        $invoice = $this->createInvoiceForNewAttendee('bob@test.com');

        $this->jsonRequest('POST', '/api/payments', [
            'invoice' => '/api/invoices/'.$invoice['id'],
            'amount' => 150.0,
        ], $this->userToken);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testDeletePaymentUnsettlesInvoiceWhenNoPaymentsRemain(): void
    {
        $invoice = $this->createInvoiceForNewAttendee('bob@test.com');

        // Create payment
        $this->jsonRequest('POST', '/api/payments', [
            'invoice' => '/api/invoices/'.$invoice['id'],
            'amount' => 100.0,
        ], $this->adminToken);
        $payment = json_decode($this->client->getResponse()->getContent(), true);

        // Delete payment
        $this->jsonRequest('DELETE', '/api/payments/'.$payment['id'], [], $this->adminToken);
        $this->assertResponseStatusCodeSame(204);

        // Invoice should now be unsettled
        $this->jsonRequest('GET', '/api/invoices/'.$invoice['id'], [], $this->adminToken);
        $updatedInvoice = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertFalse($updatedInvoice['settled']);
    }

    public function testGetPaymentsWithUserTokenReturns403(): void
    {
        $this->jsonRequest('GET', '/api/payments', [], $this->userToken);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetPaymentsWithAdminTokenReturns200(): void
    {
        $this->jsonRequest('GET', '/api/payments', [], $this->adminToken);
        $data = $this->assertJsonResponse(200);
        $this->assertArrayHasKey('member', $data);
    }

    public function testGetPaymentsWithoutTokenReturns401(): void
    {
        $this->jsonRequest('GET', '/api/payments');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testPaymentSetsDateAutomatically(): void
    {
        $invoice = $this->createInvoiceForNewAttendee('bob@test.com');

        $this->jsonRequest('POST', '/api/payments', [
            'invoice' => '/api/invoices/'.$invoice['id'],
            'amount' => 50.0,
        ], $this->adminToken);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('payment_date', $data);
        $this->assertNotNull($data['payment_date']);
    }
}
