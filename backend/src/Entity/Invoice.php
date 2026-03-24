<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\InvoiceRepository;
use App\State\InvoiceStateProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: InvoiceRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['invoice:read']],
    denormalizationContext: ['groups' => ['invoice:write']],
    operations: [
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Get(security: "is_granted('ROLE_USER')"),
        new Post(
            security: "is_granted('ROLE_ADMIN')",
            processor: InvoiceStateProcessor::class,
        ),
        new Patch(
            uriTemplate: '/invoices/{id}/mark-printed',
            name: 'invoice_mark_printed',
            security: "is_granted('ROLE_ADMIN')",
            processor: InvoiceStateProcessor::class,
        ),
    ],
)]
#[ApiFilter(BooleanFilter::class, properties: ['print', 'settled'])]
class Invoice
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['invoice:read', 'payment:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'invoices')]
    #[Groups(['invoice:read', 'invoice:write'])]
    private ?Attendee $attendee = null;

    #[ORM\Column]
    #[Groups(['invoice:read'])]
    private ?\DateTime $creation_date = null;

    #[ORM\Column]
    #[Groups(['invoice:read'])]
    private ?float $total_amount = null;

    #[ORM\Column]
    #[Groups(['invoice:read'])]
    private ?bool $print = false;

    #[ORM\Column]
    #[Groups(['invoice:read'])]
    private ?bool $settled = false;

    /**
     * @var Collection<int, Payment>
     */
    #[ORM\OneToMany(targetEntity: Payment::class, mappedBy: 'invoice')]
    #[Groups(['invoice:read'])]
    private Collection $payments;

    public function __construct()
    {
        $this->payments = new ArrayCollection();
        $this->print = false;
        $this->settled = false;
    }

    public function getId(): ?int { return $this->id; }

    public function getAttendee(): ?Attendee { return $this->attendee; }

    public function setAttendee(?Attendee $attendee): static { $this->attendee = $attendee; return $this; }

    public function getCreationDate(): ?\DateTime { return $this->creation_date; }

    public function setCreationDate(\DateTime $creation_date): static { $this->creation_date = $creation_date; return $this; }

    public function getTotalAmount(): ?float { return $this->total_amount; }

    public function setTotalAmount(float $total_amount): static { $this->total_amount = $total_amount; return $this; }

    public function isPrint(): ?bool { return $this->print; }

    public function setPrint(bool $print): static { $this->print = $print; return $this; }

    public function isSettled(): ?bool { return $this->settled; }

    public function setSettled(bool $settled): static { $this->settled = $settled; return $this; }

    /** @return Collection<int, Payment> */
    public function getPayments(): Collection { return $this->payments; }

    public function addPayment(Payment $payment): static
    {
        if (!$this->payments->contains($payment)) {
            $this->payments->add($payment);
            $payment->setInvoice($this);
        }
        return $this;
    }

    public function removePayment(Payment $payment): static
    {
        if ($this->payments->removeElement($payment)) {
            if ($payment->getInvoice() === $this) {
                $payment->setInvoice(null);
            }
        }
        return $this;
    }
}
