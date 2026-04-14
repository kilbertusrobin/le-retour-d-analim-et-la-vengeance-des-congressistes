<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
class AttendeeHotel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['attendee:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'hotelBookings')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Attendee $attendee = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['attendee:read', 'attendee:write'])]
    private ?Hotel $hotel = null;

    #[ORM\Column]
    #[Assert\Positive]
    #[Groups(['attendee:read', 'attendee:write'])]
    private int $nights = 5;

    #[ORM\Column]
    #[Groups(['attendee:read', 'attendee:write'])]
    private bool $breakfast = false;

    #[ORM\Column(type: 'date', nullable: true)]
    #[Groups(['attendee:read', 'attendee:write'])]
    private ?\DateTimeInterface $check_in_date = null;

    public function getId(): ?int { return $this->id; }

    public function getAttendee(): ?Attendee { return $this->attendee; }
    public function setAttendee(?Attendee $attendee): static { $this->attendee = $attendee; return $this; }

    public function getHotel(): ?Hotel { return $this->hotel; }
    public function setHotel(?Hotel $hotel): static { $this->hotel = $hotel; return $this; }

    public function getNights(): int { return $this->nights; }
    public function setNights(int $nights): static { $this->nights = $nights; return $this; }

    public function isBreakfast(): bool { return $this->breakfast; }
    public function setBreakfast(bool $breakfast): static { $this->breakfast = $breakfast; return $this; }

    public function getCheckInDate(): ?\DateTimeInterface { return $this->check_in_date; }
    public function setCheckInDate(?\DateTimeInterface $check_in_date): static { $this->check_in_date = $check_in_date; return $this; }
}
