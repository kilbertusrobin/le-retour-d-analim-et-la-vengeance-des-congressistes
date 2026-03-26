<?php

namespace App\Tests\Unit\State;

use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Attendee;
use App\Entity\Invoice;
use App\Entity\Session;
use App\Event\AttendeeCreatedEvent;
use App\State\AttendeeStateProcessor;
use PHPUnit\Framework\TestCase;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AttendeeStateProcessorTest extends TestCase
{
    private ProcessorInterface $persistProcessor;
    private EventDispatcherInterface $dispatcher;
    private UserPasswordHasherInterface $hasher;
    private AuthorizationCheckerInterface $authChecker;
    private AttendeeStateProcessor $processor;

    protected function setUp(): void
    {
        $this->persistProcessor = $this->createMock(ProcessorInterface::class);
        $this->persistProcessor->method('process')->willReturnArgument(0);

        $this->dispatcher = $this->createMock(EventDispatcherInterface::class);
        $this->hasher = $this->createMock(UserPasswordHasherInterface::class);
        $this->authChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $this->authChecker->method('isGranted')->willReturn(true); // admin by default in unit tests

        $this->processor = new AttendeeStateProcessor(
            $this->persistProcessor,
            $this->dispatcher,
            $this->hasher,
            $this->authChecker,
        );
    }

    private function makeAttendee(): Attendee
    {
        return (new Attendee())
            ->setFirstName('John')
            ->setLastName('Doe')
            ->setEmail('john@test.com')
            ->setAddress('Test')
            ->setDeposit(0.0)
            ->setBreakfast(false)
            ->setRoles([])
            ->setPassword('hashed');
    }

    public function testHashesPasswordWhenPlainPasswordIsSet(): void
    {
        $attendee = $this->makeAttendee()->setPlainPassword('secret123');

        $this->hasher
            ->expects($this->once())
            ->method('hashPassword')
            ->with($attendee, 'secret123')
            ->willReturn('hashed_secret');

        $this->processor->process($attendee, new Post());

        $this->assertSame('hashed_secret', $attendee->getPassword());
    }

    public function testPlainPasswordIsErasedAfterHashing(): void
    {
        $attendee = $this->makeAttendee()->setPlainPassword('secret123');
        $this->hasher->method('hashPassword')->willReturn('hashed');

        $this->processor->process($attendee, new Post());

        $this->assertNull($attendee->getPlainPassword());
    }

    public function testDoesNotHashWhenNoPlainPassword(): void
    {
        $attendee = $this->makeAttendee();

        $this->hasher->expects($this->never())->method('hashPassword');

        $this->processor->process($attendee, new Post());
    }

    public function testDispatchesCreatedEventOnPost(): void
    {
        $attendee = $this->makeAttendee();

        $this->dispatcher
            ->expects($this->once())
            ->method('dispatch')
            ->with($this->isInstanceOf(AttendeeCreatedEvent::class), AttendeeCreatedEvent::NAME);

        $this->processor->process($attendee, new Post());
    }

    public function testDoesNotDispatchCreatedEventOnPatch(): void
    {
        $attendee = $this->makeAttendee();
        $previous = $this->makeAttendee();

        $this->dispatcher->expects($this->never())->method('dispatch');

        $this->processor->process($attendee, new Patch(), [], ['previous_data' => $previous]);
    }

    public function testThrowsWhenSessionsChangedAndInvoiceExists(): void
    {
        $session1 = (new Session())->setLabel('S1')->setPrice(80)->setStartDate(new \DateTime())->setDurationHalfDays(1);
        $session2 = (new Session())->setLabel('S2')->setPrice(60)->setStartDate(new \DateTime())->setDurationHalfDays(1);

        $previous = $this->makeAttendee();
        $previous->addSessionRegistration($session1);

        $current = $this->makeAttendee();
        $current->addSessionRegistration($session2);
        $current->addInvoice(new Invoice());

        $this->expectException(UnprocessableEntityHttpException::class);

        $this->processor->process($current, new Patch(), [], ['previous_data' => $previous]);
    }

    public function testThrowsWhenActivitiesChangedAndInvoiceExists(): void
    {
        $previous = $this->makeAttendee();
        $current = $this->makeAttendee();
        $current->addInvoice(new Invoice());

        // previous has no activities, current has one → changed
        $current->addActivityRegistration(
            (new \App\Entity\Activity())->setLabel('A')->setPrice(20)->setDateTime(new \DateTime())
        );

        $this->expectException(UnprocessableEntityHttpException::class);

        $this->processor->process($current, new Patch(), [], ['previous_data' => $previous]);
    }

    public function testThrowsWhenHotelChangedAndInvoicePrinted(): void
    {
        $hotel = new \App\Entity\Hotel();
        $hotel->setName('H')->setAddress('A')->setCategory('2*')->setNightPrice(65.0)->setBreakfastPrice(10.0);

        $previous = $this->makeAttendee();
        $current = $this->makeAttendee()->setHotel($hotel);
        $current->addInvoice((new Invoice())->setPrint(true));

        $this->expectException(UnprocessableEntityHttpException::class);

        $this->processor->process($current, new Patch(), [], ['previous_data' => $previous]);
    }

    public function testDoesNotThrowWhenHotelChangedButInvoiceNotPrinted(): void
    {
        $hotel = new \App\Entity\Hotel();
        $hotel->setName('H')->setAddress('A')->setCategory('2*')->setNightPrice(65.0)->setBreakfastPrice(10.0);

        $previous = $this->makeAttendee();
        $current = $this->makeAttendee()->setHotel($hotel);
        $current->addInvoice((new Invoice())->setPrint(false));

        // No exception expected
        $result = $this->processor->process($current, new Patch(), [], ['previous_data' => $previous]);
        $this->assertSame($current, $result);
    }
}
