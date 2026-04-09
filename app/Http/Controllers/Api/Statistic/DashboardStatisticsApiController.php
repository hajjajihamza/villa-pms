<?php

namespace App\Http\Controllers\Api\Statistic;

use App\Http\Controllers\Controller;
use App\Services\Statistic\DashboardStatisticsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardStatisticsApiController extends Controller
{
    public function __construct(
        protected DashboardStatisticsService $dashboardStatisticsService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $month = $request->query('month', now()->format('Y-m'));
        $start = Carbon::parse($month)->startOfMonth();
        $end = Carbon::parse($month)->endOfMonth();

        $reservationsRevenue = $this->dashboardStatisticsService->getReservationsAmountsByPeriod($start, $end);
        $ordersRevenue = $this->dashboardStatisticsService->getOrdersAmountByPeriod($start, $end);

        return response()->json([
            'revenue' => [
                'total' => $reservationsRevenue + $ordersRevenue,
                'orders_revenue' => $ordersRevenue,
                'reservations_revenue' => $reservationsRevenue,
            ],
            'expenses' => $this->dashboardStatisticsService->getExpensesAmountByPeriod($start, $end),
            'reservations_by_channel' => $this->dashboardStatisticsService->getReservationDistributionByChannelsAndPeriod($start, $end),
            'reservations_count' => $this->dashboardStatisticsService->getReservationsCountByPeriod($start, $end),
            'orders_count' => $this->dashboardStatisticsService->getOrdersCountByPeriod($start, $end),
        ]);
    }
}
