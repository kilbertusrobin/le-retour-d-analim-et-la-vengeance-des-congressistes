<?php

namespace App\Tests\Unit\Event;

use App\Entity\Attendee;
use App\Event\AttendeeCreatedEvent;
use PHPUnit\Framework\TestCase;

class AttendeeCreatedEventTest extends TestCase
{
    public function testGetAttendeeReturnsAttendee(): void
    {
        $attendee = new Attendee();
        $event = new AttendeeCreatedEvent($attendee);

        $this->assertSame($attendee, $event->getAttendee());
    }

    public function testEventNameConstantIsDefined(): void
    {
        $this->assertSame('attendee.created', AttendeeCreatedEvent::NAME);
    }
}
