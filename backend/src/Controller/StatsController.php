<?php

namespace App\Controller;

use App\Repository\ActivityRepository;
use App\Repository\AttendeeRepository;
use App\Repository\HotelRepository;
use App\Repository\InvoiceRepository;
use App\Repository\PaymentRepository;
use App\Repository\SessionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/stats', name: 'api_stats', methods: ['GET'])]
#[IsGranted('ROLE_ADMIN')]
class StatsController extends AbstractController
{
    public function __construct(
        private AttendeeRepository $attendeeRepo,
        private InvoiceRepository $invoiceRepo,
        private PaymentRepository $paymentRepo,
        private SessionRepository $sessionRepo,
        private ActivityRepository $activityRepo,
        private HotelRepository $hotelRepo,
    ) {}

    public function __invoke(): JsonResponse
    {
        return $this->json([
            'attendees'        => $this->attendeeStats(),
            'invoices'         => $this->invoiceStats(),
            'revenue'          => $this->revenueStats(),
            'sessions'         => $this->sessionStats(),
            'activities'       => $this->activityStats(),
            'hotels'           => $this->hotelStats(),
        ]);
    }

    private function attendeeStats(): array
    {
        return [
            'total' => $this->attendeeRepo->count([]),
        ];
    }

    private function invoiceStats(): array
    {
        $total     = $this->invoiceRepo->count([]);
        $settled   = $this->invoiceRepo->count(['settled' => true]);
        $printed   = $this->invoiceRepo->count(['print' => true]);
        $unsettled = $total - $settled;

        $unsettledAmount = $this->invoiceRepo->createQueryBuilder('i')
            ->select('SUM(i.total_amount)')
            ->where('i.settled = false')
            ->getQuery()
            ->getSingleScalarResult() ?? 0.0;

        return [
            'total'            => $total,
            'settled'          => $settled,
            'unsettled'        => $unsettled,
            'printed'          => $printed,
            'unsettled_amount' => round((float) $unsettledAmount, 2),
        ];
    }

    private function revenueStats(): array
    {
        $totalRevenue = $this->paymentRepo->createQueryBuilder('p')
            ->select('SUM(p.amount)')
            ->getQuery()
            ->getSingleScalarResult() ?? 0.0;

        return [
            'total_collected' => round((float) $totalRevenue, 2),
        ];
    }

    private function sessionStats(): array
    {
        $rows = $this->sessionRepo->createQueryBuilder('s')
            ->select('s.id, s.label, COUNT(a.id) AS attendee_count')
            ->leftJoin('s.attendees', 'a')
            ->groupBy('s.id, s.label')
            ->orderBy('attendee_count', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getArrayResult();

        return $rows;
    }

    private function activityStats(): array
    {
        $rows = $this->activityRepo->createQueryBuilder('act')
            ->select('act.id, act.label, act.date_time, COUNT(a.id) AS attendee_count')
            ->leftJoin('act.attendees', 'a')
            ->groupBy('act.id, act.label, act.date_time')
            ->orderBy('attendee_count', 'DESC')
            ->getQuery()
            ->getArrayResult();

        return $rows;
    }

    private function hotelStats(): array
    {
        $rows = $this->hotelRepo->createQueryBuilder('h')
            ->select('h.id, h.name, h.category, h.night_price, COUNT(att.id) AS occupancy')
            ->leftJoin('h.attendees', 'att')
            ->groupBy('h.id, h.name, h.category, h.night_price')
            ->orderBy('occupancy', 'DESC')
            ->getQuery()
            ->getArrayResult();

        return $rows;
    }
}
