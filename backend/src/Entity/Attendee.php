<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\AttendeeRepository;
use App\State\AttendeeStateProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: AttendeeRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['attendee:read']],
    denormalizationContext: ['groups' => ['attendee:write']],
    order: ['last_name' => 'ASC', 'first_name' => 'ASC'],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(
            processor: AttendeeStateProcessor::class,
        ),
        new Put(
            security: "is_granted('ROLE_ADMIN')",
            processor: AttendeeStateProcessor::class,
        ),
        new Patch(
            security: "is_granted('ROLE_ADMIN')",
            processor: AttendeeStateProcessor::class,
        ),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
)]
#[ApiFilter(OrderFilter::class, properties: ['last_name', 'first_name', 'email'])]
#[ApiFilter(SearchFilter::class, properties: ['last_name' => 'partial', 'first_name' => 'partial', 'email' => 'exact'])]
class Attendee implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['attendee:read', 'invoice:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le prénom est obligatoire.')]
    #[Groups(['attendee:read', 'attendee:write', 'invoice:read'])]
    private ?string $first_name = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Groups(['attendee:read', 'attendee:write', 'invoice:read'])]
    private ?string $last_name = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "L'adresse est obligatoire.")]
    #[Groups(['attendee:read', 'attendee:write'])]
    private ?string $address = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "L'email est obligatoire.")]
    #[Assert\Email(message: "L'adresse email n'est pas valide.")]
    #[Groups(['attendee:read', 'attendee:write', 'invoice:read'])]
    private ?string $email = null;

    #[ORM\Column]
    #[Assert\NotNull]
    #[Assert\PositiveOrZero]
    #[Groups(['attendee:read', 'attendee:write'])]
    private ?float $deposit = null;

    #[ORM\ManyToOne(inversedBy: 'attendees')]
    #[Groups(['attendee:read', 'attendee:write'])]
    private ?Hotel $hotel = null;

    #[ORM\Column]
    #[Groups(['attendee:read', 'attendee:write'])]
    private ?bool $breakfast = false;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password = null;

    #[Groups(['attendee:write'])]
    private ?string $plainPassword = null;

    #[ORM\ManyToOne(inversedBy: 'attendees')]
    #[Groups(['attendee:read', 'attendee:write'])]
    private ?PayerOrganization $organization = null;

    /**
     * @var Collection<int, Session>
     */
    #[ORM\ManyToMany(targetEntity: Session::class, inversedBy: 'attendees')]
    #[Groups(['attendee:read', 'attendee:write'])]
    private Collection $session_registration;

    /**
     * @var Collection<int, Activity>
     */
    #[ORM\ManyToMany(targetEntity: Activity::class, inversedBy: 'attendees')]
    #[Groups(['attendee:read', 'attendee:write'])]
    private Collection $activity_registration;

    /**
     * @var Collection<int, Invoice>
     */
    #[ORM\OneToMany(targetEntity: Invoice::class, mappedBy: 'attendee')]
    #[Groups(['attendee:read'])]
    private Collection $invoices;

    public function __construct()
    {
        $this->session_registration = new ArrayCollection();
        $this->activity_registration = new ArrayCollection();
        $this->invoices = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getUserIdentifier(): string { return (string) $this->email; }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): static { $this->roles = $roles; return $this; }

    public function getPassword(): ?string { return $this->password; }

    public function setPassword(string $password): static { $this->password = $password; return $this; }

    public function getPlainPassword(): ?string { return $this->plainPassword; }

    public function setPlainPassword(?string $plainPassword): static { $this->plainPassword = $plainPassword; return $this; }

    public function eraseCredentials(): void { $this->plainPassword = null; }

    public function getFirstName(): ?string { return $this->first_name; }

    public function setFirstName(string $first_name): static { $this->first_name = $first_name; return $this; }

    public function getLastName(): ?string { return $this->last_name; }

    public function setLastName(string $last_name): static { $this->last_name = $last_name; return $this; }

    public function getAddress(): ?string { return $this->address; }

    public function setAddress(string $address): static { $this->address = $address; return $this; }

    public function getEmail(): ?string { return $this->email; }

    public function setEmail(string $email): static { $this->email = $email; return $this; }

    public function getDeposit(): ?float { return $this->deposit; }

    public function setDeposit(float $deposit): static { $this->deposit = $deposit; return $this; }

    public function getHotel(): ?Hotel { return $this->hotel; }

    public function setHotel(?Hotel $hotel): static { $this->hotel = $hotel; return $this; }

    public function isBreakfast(): ?bool { return $this->breakfast; }

    public function setBreakfast(bool $breakfast): static { $this->breakfast = $breakfast; return $this; }

    public function getOrganization(): ?PayerOrganization { return $this->organization; }

    public function setOrganization(?PayerOrganization $organization): static { $this->organization = $organization; return $this; }

    /** @return Collection<int, Session> */
    public function getSessionRegistration(): Collection { return $this->session_registration; }

    public function addSessionRegistration(Session $sessionRegistration): static
    {
        if (!$this->session_registration->contains($sessionRegistration)) {
            $this->session_registration->add($sessionRegistration);
        }
        return $this;
    }

    public function removeSessionRegistration(Session $sessionRegistration): static
    {
        $this->session_registration->removeElement($sessionRegistration);
        return $this;
    }

    /** @return Collection<int, Activity> */
    public function getActivityRegistration(): Collection { return $this->activity_registration; }

    public function addActivityRegistration(Activity $activityRegistration): static
    {
        if (!$this->activity_registration->contains($activityRegistration)) {
            $this->activity_registration->add($activityRegistration);
        }
        return $this;
    }

    public function removeActivityRegistration(Activity $activityRegistration): static
    {
        $this->activity_registration->removeElement($activityRegistration);
        return $this;
    }

    /** @return Collection<int, Invoice> */
    public function getInvoices(): Collection { return $this->invoices; }

    public function addInvoice(Invoice $invoice): static
    {
        if (!$this->invoices->contains($invoice)) {
            $this->invoices->add($invoice);
            $invoice->setAttendee($this);
        }
        return $this;
    }

    public function removeInvoice(Invoice $invoice): static
    {
        if ($this->invoices->removeElement($invoice)) {
            if ($invoice->getAttendee() === $this) {
                $invoice->setAttendee(null);
            }
        }
        return $this;
    }

    public function hasInvoice(): bool
    {
        return !$this->invoices->isEmpty();
    }

    public function hasPrintedInvoice(): bool
    {
        foreach ($this->invoices as $invoice) {
            if ($invoice->isPrint()) {
                return true;
            }
        }
        return false;
    }
}
