<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\HotelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: HotelRepository::class)]
#[ApiResource]
class Hotel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $address = null;

    #[ORM\Column(length: 255)]
    private ?string $category = null;

    #[ORM\Column]
    private ?float $night_price = null;

    #[ORM\Column]
    private ?float $breakfast_price = null;

    /**
     * @var Collection<int, Attendee>
     */
    #[ORM\OneToMany(targetEntity: Attendee::class, mappedBy: 'hotel')]
    private Collection $attendees;

    public function __construct()
    {
        $this->attendees = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getNightPrice(): ?float
    {
        return $this->night_price;
    }

    public function setNightPrice(float $night_price): static
    {
        $this->night_price = $night_price;

        return $this;
    }

    public function getBreakfastPrice(): ?float
    {
        return $this->breakfast_price;
    }

    public function setBreakfastPrice(float $breakfast_price): static
    {
        $this->breakfast_price = $breakfast_price;

        return $this;
    }

    /**
     * @return Collection<int, Attendee>
     */
    public function getAttendees(): Collection
    {
        return $this->attendees;
    }

    public function addAttendee(Attendee $attendee): static
    {
        if (!$this->attendees->contains($attendee)) {
            $this->attendees->add($attendee);
            $attendee->setHotel($this);
        }

        return $this;
    }

    public function removeAttendee(Attendee $attendee): static
    {
        if ($this->attendees->removeElement($attendee)) {
            // set the owning side to null (unless already changed)
            if ($attendee->getHotel() === $this) {
                $attendee->setHotel(null);
            }
        }

        return $this;
    }
}
