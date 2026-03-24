<?php

namespace App\Tests\Unit\State;

use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Activity;
use App\Entity\Attendee;
use App\Entity\Hotel;
use App\Entity\Invoice;
use App\Entity\Session;
use App\State\InvoiceStateProcessor;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class InvoiceStateProcessorTest extends TestCase
{
    private ProcessorInterface $persistProcessor;
    private InvoiceStateProcessor $processor;

    protected function setUp(): void
    {
        $this->persistProcessor = $this->createMock(ProcessorInterface::class);
        $this->persistProcessor->method('process')->willReturnArgument(0);
        $this->processor = new InvoiceStateProcessor($this->persistProcessor);
    }

    private function makeAttendee(float $deposit = 0.0): Attendee
    {
        return (new Attendee())
            ->setFirstName('John')
            ->setLastName('Doe')
            ->setEmail('john@test.com')
            ->setAddress('Test Address')
            ->setDeposit($deposit)
            ->setBreakfast(false)
            ->setRoles([])
            ->setPassword('hashed');
    }

    public function testThrowsWhenAttendeeIsNull(): void
    {
        $this->expectException(UnprocessableEntityHttpException::class);
        $this->processor->process(new Invoice(), new Post());
    }

    public function testThrowsWhenAttendeeAlreadyHasInvoice(): void
    {
        $this->expectException(ConflictHttpException::class);

        $attendee = $this->makeAttendee();
        $attendee->addInvoice(new Invoice());

        $this->processor->process((new Invoice())->setAttendee($attendee), new Post());
    }

    public function testSetsCreationDateOnCreate(): void
    {
        $invoice = (new Invoice())->setAttendee($this->makeAttendee());
        $before = new \DateTime();

        $this->processor->process($invoice, new Post());

        $this->assertNotNull($invoice->getCreationDate());
        $this->assertGreaterThanOrEqual($before, $invoice->getCreationDate());
    }

    public function testSetsPrintFalseAndSettledFalseOnCreate(): void
    {
        $invoice = (new Invoice())->setAttendee($this->makeAttendee());

        $this->processor->process($invoice, new Post());

        $this->assertFalse($invoice->isPrint());
        $this->assertFalse($invoice->isSettled());
    }

    public function testCalculatesTotalHotelOnly(): void
    {
        // 65.0 * 5 nights = 325.0, minus deposit 100 = 225.0
        $hotel = (new Hotel())->setNightPrice(65.0)->setBreakfastPrice(10.0);
        $attendee = $this->makeAttendee(100.0)->setHotel($hotel);
        $invoice = (new Invoice())->setAttendee($attendee);

        $this->processor->process($invoice, new Post());

        $this->assertEquals(225.0, $invoice->getTotalAmount());
    }

    public function testCalculatesTotalHotelWithBreakfast(): void
    {
        // (65 + 10) * 5 = 375.0, no deposit
        $hotel = (new Hotel())->setNightPrice(65.0)->setBreakfastPrice(10.0);
        $attendee = $this->makeAttendee(0.0)->setHotel($hotel)->setBreakfast(true);
        $invoice = (new Invoice())->setAttendee($attendee);

        $this->processor->process($invoice, new Post());

        $this->assertEquals(375.0, $invoice->getTotalAmount());
    }

    public function testCalculatesTotalWithSessions(): void
    {
        // sessions: 80 + 60 = 140, no hotel, no deposit
        $attendee = $this->makeAttendee(0.0);
        $attendee->addSessionRegistration(
            (new Session())->setLabel('S1')->setPrice(80)->setStartDate(new \DateTime())->setDurationHalfDays(1)
        );
        $attendee->addSessionRegistration(
            (new Session())->setLabel('S2')->setPrice(60)->setStartDate(new \DateTime())->setDurationHalfDays(1)
        );

        $invoice = (new Invoice())->setAttendee($attendee);
        $this->processor->process($invoice, new Post());

        $this->assertEquals(140.0, $invoice->getTotalAmount());
    }

    public function testCalculatesTotalWithActivities(): void
    {
        // activities: 35 + 15 = 50, no hotel, no deposit
        $attendee = $this->makeAttendee(0.0);
        $attendee->addActivityRegistration(
            (new Activity())->setLabel('A1')->setPrice(35)->setDateTime(new \DateTime())
        );
        $attendee->addActivityRegistration(
            (new Activity())->setLabel('A2')->setPrice(15)->setDateTime(new \DateTime())
        );

        $invoice = (new Invoice())->setAttendee($attendee);
        $this->processor->process($invoice, new Post());

        $this->assertEquals(50.0, $invoice->getTotalAmount());
    }

    public function testCalculatesTotalIsNeverNegative(): void
    {
        // hotel 65*5=325, deposit 500 → max(0, 325-500) = 0
        $hotel = (new Hotel())->setNightPrice(65.0)->setBreakfastPrice(0.0);
        $attendee = $this->makeAttendee(500.0)->setHotel($hotel);
        $invoice = (new Invoice())->setAttendee($attendee);

        $this->processor->process($invoice, new Post());

        $this->assertEquals(0.0, $invoice->getTotalAmount());
    }

    public function testCalculatesTotalFullCombination(): void
    {
        // hotel: 65*5=325, breakfast: 10*5=50, session: 80, activity: 35, deposit: 100
        // total = 325+50+80+35-100 = 390
        $hotel = (new Hotel())->setNightPrice(65.0)->setBreakfastPrice(10.0);
        $attendee = $this->makeAttendee(100.0)->setHotel($hotel)->setBreakfast(true);
        $attendee->addSessionRegistration(
            (new Session())->setLabel('S')->setPrice(80)->setStartDate(new \DateTime())->setDurationHalfDays(1)
        );
        $attendee->addActivityRegistration(
            (new Activity())->setLabel('A')->setPrice(35)->setDateTime(new \DateTime())
        );

        $invoice = (new Invoice())->setAttendee($attendee);
        $this->processor->process($invoice, new Post());

        $this->assertEquals(390.0, $invoice->getTotalAmount());
    }

    public function testMarkPrintedSetsPrintToTrue(): void
    {
        $invoice = (new Invoice())->setPrint(false);
        $patch = new Patch(name: 'invoice_mark_printed');

        $this->processor->process($invoice, $patch);

        $this->assertTrue($invoice->isPrint());
    }

    public function testPersistProcessorIsCalledOnCreate(): void
    {
        $attendee = $this->makeAttendee();
        $invoice = (new Invoice())->setAttendee($attendee);

        $this->persistProcessor
            ->expects($this->once())
            ->method('process')
            ->with($invoice)
            ->willReturn($invoice);

        $this->processor->process($invoice, new Post());
    }
}
