<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\ActivityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ActivityRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['activity:read']],
    denormalizationContext: ['groups' => ['activity:write']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
)]
class Activity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['activity:read', 'attendee:read', 'invoice:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "Le libellé de l'activité est obligatoire.")]
    #[Groups(['activity:read', 'activity:write', 'attendee:read', 'invoice:read'])]
    private ?string $label = null;

    #[ORM\Column]
    #[Assert\NotNull(message: "La date et l'heure sont obligatoires.")]
    #[Groups(['activity:read', 'activity:write', 'attendee:read'])]
    private ?\DateTime $date_time = null;

    #[ORM\Column]
    #[Assert\NotNull]
    #[Assert\Positive(message: "Le prix de l'activité doit être positif.")]
    #[Groups(['activity:read', 'activity:write', 'invoice:read'])]
    private ?int $price = null;

    /**
     * @var Collection<int, Attendee>
     */
    #[ORM\ManyToMany(targetEntity: Attendee::class, mappedBy: 'activity_registration')]
    #[Groups(['activity:read'])]
    private Collection $attendees;

    public function __construct()
    {
        $this->attendees = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getLabel(): ?string { return $this->label; }

    public function setLabel(string $label): static { $this->label = $label; return $this; }

    public function getDateTime(): ?\DateTime { return $this->date_time; }

    public function setDateTime(\DateTime $date_time): static { $this->date_time = $date_time; return $this; }

    public function getPrice(): ?int { return $this->price; }

    public function setPrice(int $price): static { $this->price = $price; return $this; }

    /** @return Collection<int, Attendee> */
    public function getAttendees(): Collection { return $this->attendees; }

    public function addAttendee(Attendee $attendee): static
    {
        if (!$this->attendees->contains($attendee)) {
            $this->attendees->add($attendee);
            $attendee->addActivityRegistration($this);
        }
        return $this;
    }

    public function removeAttendee(Attendee $attendee): static
    {
        if ($this->attendees->removeElement($attendee)) {
            $attendee->removeActivityRegistration($this);
        }
        return $this;
    }
}
