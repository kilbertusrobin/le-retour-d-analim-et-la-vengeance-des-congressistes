<?php

namespace App\State;

use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Payment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * POST   /api/payments  → sets payment_date = now(), marks invoice as settled
 * DELETE /api/payments/{id} → removes payment, re-evaluates invoice settled status
 */
class PaymentStateProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        #[Autowire(service: 'api_platform.doctrine.orm.state.remove_processor')]
        private ProcessorInterface $removeProcessor,
        private EntityManagerInterface $em,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Payment) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        if ($operation instanceof Post) {
            return $this->handleCreate($data, $operation, $uriVariables, $context);
        }

        if ($operation instanceof Delete) {
            return $this->handleDelete($data, $operation, $uriVariables, $context);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }

    private function handleCreate(Payment $payment, Operation $operation, array $uriVariables, array $context): mixed
    {
        $invoice = $payment->getInvoice();

        if ($invoice === null) {
            throw new UnprocessableEntityHttpException('La facture est obligatoire.');
        }

        $payment->setPaymentDate(new \DateTime());

        $result = $this->persistProcessor->process($payment, $operation, $uriVariables, $context);

        // Mark invoice as settled
        $invoice->setSettled(true);
        $this->em->flush();

        return $result;
    }

    private function handleDelete(Payment $payment, Operation $operation, array $uriVariables, array $context): mixed
    {
        $invoice = $payment->getInvoice();

        $result = $this->removeProcessor->process($payment, $operation, $uriVariables, $context);

        // Re-evaluate settled status: settled only if remaining payments exist
        if ($invoice !== null) {
            $this->em->refresh($invoice);
            $invoice->setSettled(!$invoice->getPayments()->isEmpty());
            $this->em->flush();
        }

        return $result;
    }
}
