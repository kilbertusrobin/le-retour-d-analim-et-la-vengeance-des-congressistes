<?php

namespace App\Entity;

use App\Repository\PaymentRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PaymentRepository::class)]
class Payment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'payments')]
    private ?Invoice $invoice = null;

    #[ORM\ManyToOne(inversedBy: 'payments')]
    private ?PayerOrganization $organization = null;

    #[ORM\Column]
    private ?float $amount = null;

    #[ORM\Column]
    private ?\DateTime $payment_date = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getInvoice(): ?Invoice
    {
        return $this->invoice;
    }

    public function setInvoice(?Invoice $invoice): static
    {
        $this->invoice = $invoice;

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

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getPaymentDate(): ?\DateTime
    {
        return $this->payment_date;
    }

    public function setPaymentDate(\DateTime $payment_date): static
    {
        $this->payment_date = $payment_date;

        return $this;
    }
}
