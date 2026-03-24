<?php

namespace App\Controller;

use App\Entity\Invoice;
use App\Repository\InvoiceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Generates a PDF for a given invoice.
 * Requires: composer require dompdf/dompdf
 */
#[Route('/api/invoices/{id}/pdf', name: 'api_invoice_pdf', methods: ['GET'])]
#[IsGranted('ROLE_USER')]
class InvoicePdfController extends AbstractController
{
    public function __construct(
        private InvoiceRepository $invoiceRepository,
    ) {}

    public function __invoke(int $id): Response
    {
        $invoice = $this->invoiceRepository->find($id);

        if ($invoice === null) {
            throw new NotFoundHttpException('Facture introuvable.');
        }

        if (!class_exists(\Dompdf\Dompdf::class)) {
            return new Response(
                json_encode(['error' => 'PDF export requires dompdf. Run: composer require dompdf/dompdf']),
                Response::HTTP_NOT_IMPLEMENTED,
                ['Content-Type' => 'application/json']
            );
        }

        $html = $this->renderView('invoice/pdf.html.twig', ['invoice' => $invoice]);

        $dompdf = new \Dompdf\Dompdf(['isRemoteEnabled' => false]);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $filename = sprintf('facture-%d-%s-%s.pdf',
            $invoice->getId(),
            $invoice->getAttendee()?->getLastName() ?? 'inconnu',
            $invoice->getCreationDate()?->format('Y-m-d') ?? 'date'
        );

        return new Response(
            $dompdf->output(),
            Response::HTTP_OK,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => sprintf('inline; filename="%s"', $filename),
            ]
        );
    }
}
