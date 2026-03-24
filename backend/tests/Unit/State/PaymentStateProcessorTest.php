<?php

namespace App\Tests\Unit\State;

use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Invoice;
use App\Entity\Payment;
use App\State\PaymentStateProcessor;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class PaymentStateProcessorTest extends TestCase
{
    private ProcessorInterface $persistProcessor;
    private ProcessorInterface $removeProcessor;
    private EntityManagerInterface $em;
    private PaymentStateProcessor $processor;

    protected function setUp(): void
    {
        $this->persistProcessor = $this->createMock(ProcessorInterface::class);
        $this->persistProcessor->method('process')->willReturnArgument(0);

        $this->removeProcessor = $this->createMock(ProcessorInterface::class);
        $this->removeProcessor->method('process')->willReturn(null);

        $this->em = $this->createMock(EntityManagerInterface::class);

        $this->processor = new PaymentStateProcessor(
            $this->persistProcessor,
            $this->removeProcessor,
            $this->em
        );
    }

    public function testThrowsWhenInvoiceIsNull(): void
    {
        $this->expectException(UnprocessableEntityHttpException::class);
        $this->processor->process(new Payment(), new Post());
    }

    public function testSetsPaymentDateOnCreate(): void
    {
        $invoice = new Invoice();
        $payment = (new Payment())->setInvoice($invoice)->setAmount(100.0);

        $before = new \DateTime();
        $this->processor->process($payment, new Post());
        $after = new \DateTime();

        $this->assertNotNull($payment->getPaymentDate());
        $this->assertGreaterThanOrEqual($before, $payment->getPaymentDate());
        $this->assertLessThanOrEqual($after, $payment->getPaymentDate());
    }

    public function testMarksInvoiceAsSettledOnCreate(): void
    {
        $invoice = new Invoice();
        $payment = (new Payment())->setInvoice($invoice)->setAmount(100.0);

        $this->em->expects($this->once())->method('flush');

        $this->processor->process($payment, new Post());

        $this->assertTrue($invoice->isSettled());
    }

    public function testSetsInvoiceSettledFalseWhenLastPaymentDeleted(): void
    {
        // Invoice has no payments in its collection → isEmpty() = true after delete
        $invoice = new Invoice();
        $payment = (new Payment())->setInvoice($invoice)->setAmount(100.0);

        $this->em->method('refresh')->willReturnCallback(function () {
            // No-op: invoice payments collection stays empty
        });
        $this->em->expects($this->once())->method('flush');

        $this->processor->process($payment, new Delete());

        $this->assertFalse($invoice->isSettled());
    }

    public function testKeepsInvoiceSettledTrueWhenOtherPaymentsExist(): void
    {
        // Invoice has one OTHER payment already in its collection
        $invoice = new Invoice();
        $otherPayment = (new Payment())->setAmount(50.0);
        $invoice->addPayment($otherPayment);

        $paymentToDelete = (new Payment())->setInvoice($invoice)->setAmount(100.0);

        $this->em->method('refresh'); // no-op: collection stays as set up
        $this->em->expects($this->once())->method('flush');

        $this->processor->process($paymentToDelete, new Delete());

        $this->assertTrue($invoice->isSettled());
    }

    public function testCallsRemoveProcessorOnDelete(): void
    {
        $invoice = new Invoice();
        $payment = (new Payment())->setInvoice($invoice)->setAmount(100.0);

        $this->removeProcessor
            ->expects($this->once())
            ->method('process')
            ->with($payment);

        $this->processor->process($payment, new Delete());
    }
}
