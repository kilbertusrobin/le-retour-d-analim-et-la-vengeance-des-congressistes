<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\PayerOrganizationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PayerOrganizationRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['organization:read']],
    denormalizationContext: ['groups' => ['organization:write']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
)]
class PayerOrganization
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['organization:read', 'attendee:read', 'invoice:read', 'payment:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "Le nom de l'organisme est obligatoire.")]
    #[Groups(['organization:read', 'organization:write', 'attendee:read', 'invoice:read', 'payment:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "L'adresse est obligatoire.")]
    #[Groups(['organization:read', 'organization:write'])]
    private ?string $address = null;

    /**
     * @var Collection<int, Attendee>
     */
    #[ORM\OneToMany(targetEntity: Attendee::class, mappedBy: 'organization')]
    private Collection $attendees;

    /**
     * @var Collection<int, Payment>
     */
    #[ORM\OneToMany(targetEntity: Payment::class, mappedBy: 'organization')]
    private Collection $payments;

    public function __construct()
    {
        $this->attendees = new ArrayCollection();
        $this->payments = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): ?string { return $this->name; }

    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getAddress(): ?string { return $this->address; }

    public function setAddress(string $address): static { $this->address = $address; return $this; }

    /** @return Collection<int, Attendee> */
    public function getAttendees(): Collection { return $this->attendees; }

    public function addAttendee(Attendee $attendee): static
    {
        if (!$this->attendees->contains($attendee)) {
            $this->attendees->add($attendee);
            $attendee->setOrganization($this);
        }
        return $this;
    }

    public function removeAttendee(Attendee $attendee): static
    {
        if ($this->attendees->removeElement($attendee)) {
            if ($attendee->getOrganization() === $this) {
                $attendee->setOrganization(null);
            }
        }
        return $this;
    }

    /** @return Collection<int, Payment> */
    public function getPayments(): Collection { return $this->payments; }

    public function addPayment(Payment $payment): static
    {
        if (!$this->payments->contains($payment)) {
            $this->payments->add($payment);
            $payment->setOrganization($this);
        }
        return $this;
    }

    public function removePayment(Payment $payment): static
    {
        if ($this->payments->removeElement($payment)) {
            if ($payment->getOrganization() === $this) {
                $payment->setOrganization(null);
            }
        }
        return $this;
    }
}
