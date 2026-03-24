<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\HotelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: HotelRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['hotel:read']],
    denormalizationContext: ['groups' => ['hotel:write']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
)]
class Hotel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['hotel:read', 'attendee:read', 'invoice:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Groups(['hotel:read', 'hotel:write', 'attendee:read', 'invoice:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "L'adresse est obligatoire.")]
    #[Groups(['hotel:read', 'hotel:write'])]
    private ?string $address = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'La catégorie est obligatoire.')]
    #[Groups(['hotel:read', 'hotel:write', 'attendee:read'])]
    private ?string $category = null;

    #[ORM\Column]
    #[Assert\NotNull]
    #[Assert\Positive(message: 'Le prix par nuit doit être positif.')]
    #[Groups(['hotel:read', 'hotel:write', 'attendee:read', 'invoice:read'])]
    private ?float $night_price = null;

    #[ORM\Column]
    #[Assert\NotNull]
    #[Assert\PositiveOrZero(message: 'Le prix du petit-déjeuner doit être positif ou nul.')]
    #[Groups(['hotel:read', 'hotel:write', 'attendee:read', 'invoice:read'])]
    private ?float $breakfast_price = null;

    /**
     * @var Collection<int, Attendee>
     */
    #[ORM\OneToMany(targetEntity: Attendee::class, mappedBy: 'hotel')]
    #[Groups(['hotel:read'])]
    private Collection $attendees;

    public function __construct()
    {
        $this->attendees = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): ?string { return $this->name; }

    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getAddress(): ?string { return $this->address; }

    public function setAddress(string $address): static { $this->address = $address; return $this; }

    public function getCategory(): ?string { return $this->category; }

    public function setCategory(string $category): static { $this->category = $category; return $this; }

    public function getNightPrice(): ?float { return $this->night_price; }

    public function setNightPrice(float $night_price): static { $this->night_price = $night_price; return $this; }

    public function getBreakfastPrice(): ?float { return $this->breakfast_price; }

    public function setBreakfastPrice(float $breakfast_price): static { $this->breakfast_price = $breakfast_price; return $this; }

    /** @return Collection<int, Attendee> */
    public function getAttendees(): Collection { return $this->attendees; }

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
            if ($attendee->getHotel() === $this) {
                $attendee->setHotel(null);
            }
        }
        return $this;
    }
}
