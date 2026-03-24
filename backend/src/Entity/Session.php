<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\SessionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SessionRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['session:read']],
    denormalizationContext: ['groups' => ['session:write']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
)]
class Session
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['session:read', 'attendee:read', 'invoice:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le libellé est obligatoire.')]
    #[Groups(['session:read', 'session:write', 'attendee:read', 'invoice:read'])]
    private ?string $label = null;

    #[ORM\Column]
    #[Assert\NotNull(message: 'La date de début est obligatoire.')]
    #[Groups(['session:read', 'session:write', 'attendee:read'])]
    private ?\DateTime $start_date = null;

    #[ORM\Column]
    #[Assert\NotNull]
    #[Assert\Positive]
    #[Groups(['session:read', 'session:write'])]
    private ?int $duration_half_days = null;

    #[ORM\Column]
    #[Assert\NotNull]
    #[Assert\Positive(message: 'Le prix doit être positif.')]
    #[Groups(['session:read', 'session:write', 'invoice:read'])]
    private ?int $price = null;

    /**
     * @var Collection<int, Attendee>
     */
    #[ORM\ManyToMany(targetEntity: Attendee::class, mappedBy: 'session_registration')]
    #[Groups(['session:read'])]
    private Collection $attendees;

    public function __construct()
    {
        $this->attendees = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getLabel(): ?string { return $this->label; }

    public function setLabel(string $label): static { $this->label = $label; return $this; }

    public function getStartDate(): ?\DateTime { return $this->start_date; }

    public function setStartDate(\DateTime $start_date): static { $this->start_date = $start_date; return $this; }

    public function getDurationHalfDays(): ?int { return $this->duration_half_days; }

    public function setDurationHalfDays(int $duration_half_days): static { $this->duration_half_days = $duration_half_days; return $this; }

    public function getPrice(): ?int { return $this->price; }

    public function setPrice(int $price): static { $this->price = $price; return $this; }

    /** @return Collection<int, Attendee> */
    public function getAttendees(): Collection { return $this->attendees; }

    public function addAttendee(Attendee $attendee): static
    {
        if (!$this->attendees->contains($attendee)) {
            $this->attendees->add($attendee);
            $attendee->addSessionRegistration($this);
        }
        return $this;
    }

    public function removeAttendee(Attendee $attendee): static
    {
        if ($this->attendees->removeElement($attendee)) {
            $attendee->removeSessionRegistration($this);
        }
        return $this;
    }
}
