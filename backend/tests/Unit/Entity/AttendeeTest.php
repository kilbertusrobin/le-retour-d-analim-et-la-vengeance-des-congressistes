<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Attendee;
use App\Entity\Invoice;
use PHPUnit\Framework\TestCase;

class AttendeeTest extends TestCase
{
    private Attendee $attendee;

    protected function setUp(): void
    {
        $this->attendee = new Attendee();
    }

    public function testGetRolesAlwaysIncludesRoleUser(): void
    {
        $this->attendee->setRoles([]);
        $this->assertContains('ROLE_USER', $this->attendee->getRoles());
    }

    public function testGetRolesIncludesAdminRoleWhenSet(): void
    {
        $this->attendee->setRoles(['ROLE_ADMIN']);
        $roles = $this->attendee->getRoles();
        $this->assertContains('ROLE_ADMIN', $roles);
        $this->assertContains('ROLE_USER', $roles);
    }

    public function testGetRolesHasNoDuplicates(): void
    {
        $this->attendee->setRoles(['ROLE_USER']);
        $roles = $this->attendee->getRoles();
        $this->assertSame(array_unique($roles), $roles);
    }

    public function testHasInvoiceReturnsFalseWhenNoInvoice(): void
    {
        $this->assertFalse($this->attendee->hasInvoice());
    }

    public function testHasInvoiceReturnsTrueAfterInvoiceAdded(): void
    {
        $this->attendee->addInvoice(new Invoice());
        $this->assertTrue($this->attendee->hasInvoice());
    }

    public function testHasPrintedInvoiceReturnsFalseWhenNoInvoice(): void
    {
        $this->assertFalse($this->attendee->hasPrintedInvoice());
    }

    public function testHasPrintedInvoiceReturnsFalseWhenInvoiceNotPrinted(): void
    {
        $invoice = (new Invoice())->setPrint(false);
        $this->attendee->addInvoice($invoice);
        $this->assertFalse($this->attendee->hasPrintedInvoice());
    }

    public function testHasPrintedInvoiceReturnsTrueWhenInvoicePrinted(): void
    {
        $invoice = (new Invoice())->setPrint(true);
        $this->attendee->addInvoice($invoice);
        $this->assertTrue($this->attendee->hasPrintedInvoice());
    }

    public function testEraseCredentialsClearsPlainPassword(): void
    {
        $this->attendee->setPlainPassword('secret123');
        $this->attendee->eraseCredentials();
        $this->assertNull($this->attendee->getPlainPassword());
    }

    public function testGetUserIdentifierReturnsEmail(): void
    {
        $this->attendee->setEmail('test@example.com');
        $this->assertSame('test@example.com', $this->attendee->getUserIdentifier());
    }
}
