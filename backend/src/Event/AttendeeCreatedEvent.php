<?php

namespace App\Event;

use App\Entity\Attendee;
use Symfony\Contracts\EventDispatcher\Event;

class AttendeeCreatedEvent extends Event
{
    public const NAME = 'attendee.created';

    public function __construct(
        private readonly Attendee $attendee,
    ) {}

    public function getAttendee(): Attendee
    {
        return $this->attendee;
    }
}
