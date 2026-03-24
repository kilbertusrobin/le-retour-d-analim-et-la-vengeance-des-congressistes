<?php

namespace App\State;

use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Invoice;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * POST  /api/invoices       → auto-calculates total_amount, sets creation_date, blocks duplicate
 * PATCH /api/invoices/{id}/mark-printed → sets print=true (irreversible)
 */
class InvoiceStateProcessor implements ProcessorInterface
{
    // Congress lasts 5 working days
    private const CONGRESS_DAYS = 5;

    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Invoice) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        if ($operation instanceof Post) {
            $this->handleCreate($data);
        } elseif ($operation instanceof Patch && str_ends_with($operation->getName() ?? '', 'mark_printed')) {
            $this->handleMarkPrinted($data);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }

    private function handleCreate(Invoice $invoice): void
    {
        $attendee = $invoice->getAttendee();

        if ($attendee === null) {
            throw new UnprocessableEntityHttpException('Le congressiste est obligatoire.');
        }

        if ($attendee->hasInvoice()) {
            throw new ConflictHttpException(
                sprintf(
                    'Une facture existe déjà pour %s %s.',
                    $attendee->getFirstName(),
                    $attendee->getLastName()
                )
            );
        }

        $invoice->setCreationDate(new \DateTime());
        $invoice->setPrint(false);
        $invoice->setSettled(false);
        $invoice->setTotalAmount($this->calculateTotal($attendee, $invoice));
    }

    private function handleMarkPrinted(Invoice $invoice): void
    {
        $invoice->setPrint(true);
    }

    private function calculateTotal(mixed $attendee, Invoice $invoice): float
    {
        $total = 0.0;

        // Hotel cost: night_price * congress days (+ breakfast_price * days if requested)
        $hotel = $attendee->getHotel();
        if ($hotel !== null) {
            $total += $hotel->getNightPrice() * self::CONGRESS_DAYS;
            if ($attendee->isBreakfast()) {
                $total += $hotel->getBreakfastPrice() * self::CONGRESS_DAYS;
            }
        }

        // Sessions
        foreach ($attendee->getSessionRegistration() as $session) {
            $total += $session->getPrice();
        }

        // Activities
        foreach ($attendee->getActivityRegistration() as $activity) {
            $total += $activity->getPrice();
        }

        // Subtract deposit already paid
        $deposit = $attendee->getDeposit() ?? 0.0;
        $total = max(0.0, $total - $deposit);

        return round($total, 2);
    }
}
