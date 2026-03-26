<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\PaymentRepository;
use App\State\PaymentStateProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PaymentRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['payment:read']],
    denormalizationContext: ['groups' => ['payment:write']],
    operations: [
        new GetCollection(security: "is_granted('ROLE_ADMIN')"),
        new Get(security: "is_granted('ROLE_ADMIN') or object.getInvoice().getAttendee() == user"),
        new Post(
            security: "is_granted('ROLE_ADMIN')",
            processor: PaymentStateProcessor::class,
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')",
            processor: PaymentStateProcessor::class,
        ),
    ],
)]
class Payment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['payment:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'payments')]
    #[Assert\NotNull(message: 'La facture est obligatoire.')]
    #[Groups(['payment:read', 'payment:write'])]
    private ?Invoice $invoice = null;

    #[ORM\ManyToOne(inversedBy: 'payments')]
    #[Groups(['payment:read', 'payment:write'])]
    private ?PayerOrganization $organization = null;

    #[ORM\Column]
    #[Assert\NotNull]
    #[Assert\Positive(message: 'Le montant doit être positif.')]
    #[Groups(['payment:read', 'payment:write'])]
    private ?float $amount = null;

    #[ORM\Column]
    #[Groups(['payment:read'])]
    private ?\DateTime $payment_date = null;

    public function getId(): ?int { return $this->id; }

    public function getInvoice(): ?Invoice { return $this->invoice; }

    public function setInvoice(?Invoice $invoice): static { $this->invoice = $invoice; return $this; }

    public function getOrganization(): ?PayerOrganization { return $this->organization; }

    public function setOrganization(?PayerOrganization $organization): static { $this->organization = $organization; return $this; }

    public function getAmount(): ?float { return $this->amount; }

    public function setAmount(float $amount): static { $this->amount = $amount; return $this; }

    public function getPaymentDate(): ?\DateTime { return $this->payment_date; }

    public function setPaymentDate(\DateTime $payment_date): static { $this->payment_date = $payment_date; return $this; }
}
