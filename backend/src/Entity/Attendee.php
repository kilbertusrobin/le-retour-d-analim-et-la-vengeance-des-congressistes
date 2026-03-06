<?php

namespace App\Entity;

use App\Repository\AttendeeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AttendeeRepository::class)]
class Attendee
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $first_name = null;

    #[ORM\Column(length: 255)]
    private ?string $last_name = null;

    #[ORM\Column(length: 255)]
    private ?string $address = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column]
    private ?float $deposit = null;

    #[ORM\ManyToOne(inversedBy: 'attendees')]
    private ?Hotel $hotel = null;

    #[ORM\Column]
    private ?bool $breakfast = null;

    #[ORM\ManyToOne(inversedBy: 'attendees')]
    private ?PayerOrganization $organization = null;

    /**
     * @var Collection<int, Session>
     */
    #[ORM\ManyToMany(targetEntity: Session::class, inversedBy: 'attendees')]
    private Collection $session_registration;

    /**
     * @var Collection<int, Activity>
     */
    #[ORM\ManyToMany(targetEntity: Activity::class, inversedBy: 'attendees')]
    private Collection $activity_registration;

    /**
     * @var Collection<int, Invoice>
     */
    #[ORM\OneToMany(targetEntity: Invoice::class, mappedBy: 'attendee')]
    private Collection $invoices;

    public function __construct()
    {
        $this->session_registration = new ArrayCollection();
        $this->activity_registration = new ArrayCollection();
        $this->invoices = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): ?string
    {
        return $this->first_name;
    }

    public function setFirstName(string $first_name): static
    {
        $this->first_name = $first_name;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->last_name;
    }

    public function setLastName(string $last_name): static
    {
        $this->last_name = $last_name;

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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getDeposit(): ?float
    {
        return $this->deposit;
    }

    public function setDeposit(float $deposit): static
    {
        $this->deposit = $deposit;

        return $this;
    }

    public function getHotel(): ?Hotel
    {
        return $this->hotel;
    }

    public function setHotel(?Hotel $hotel): static
    {
        $this->hotel = $hotel;

        return $this;
    }

    public function isBreakfast(): ?bool
    {
        return $this->breakfast;
    }

    public function setBreakfast(bool $breakfast): static
    {
        $this->breakfast = $breakfast;

        return $this;
    }

    public function getOrganization(): ?PayerOrganization
    {
        return $this->organization;
    }

    public function setOrganization(?PayerOrganization $organization): static
    {
        $this->organization = $organization;

        return $this;
    }

    /**
     * @return Collection<int, Session>
     */
    public function getSessionRegistration(): Collection
    {
        return $this->session_registration;
    }

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

    /**
     * @return Collection<int, Activity>
     */
    public function getActivityRegistration(): Collection
    {
        return $this->activity_registration;
    }

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

    /**
     * @return Collection<int, Invoice>
     */
    public function getInvoices(): Collection
    {
        return $this->invoices;
    }

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
            // set the owning side to null (unless already changed)
            if ($invoice->getAttendee() === $this) {
                $invoice->setAttendee(null);
            }
        }

        return $this;
    }
}
