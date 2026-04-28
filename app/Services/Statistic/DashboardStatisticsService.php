<?php

declare(strict_types=1);

namespace App\Services\Statistic;

use App\Models\Expense;
use App\Models\Order;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardStatisticsService
{
    // ────────────────────────────────────────────────
    //  Reservations
    // ────────────────────────────────────────────────
    public function getReservationsCountByPeriod(Carbon $start, Carbon $end): int
    {
        return Reservation::query()
            ->whereBetween('check_in', [$start->toDateString(), $end->toDateString()])
            ->count();
    }

    public function getReservationsAmountsByPeriod(Carbon $start, Carbon $end): float
    {
        return (float) (Reservation::query()
            ->whereBetween('check_in', [$start->toDateString(), $end->toDateString()])
            ->select(DB::raw('SUM(daily_price * DATEDIFF(check_out, check_in)) as amount'))
            ->value('amount') ?? 0);
    }

    // ────────────────────────────────────────────────
    //  Channels
    // ────────────────────────────────────────────────

    public function getReservationDistributionByChannelsAndPeriod(Carbon $start, Carbon $end): array
    {
        $data = Reservation::query()
            ->join('channels', 'channels.id', '=', 'reservations.channel_id')
            ->whereBetween('check_in', [$start->toDateString(), $end->toDateString()])
            ->select(
                'channels.id',
                'channels.name',
                'channels.color',
                'channels.commission',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(daily_price * DATEDIFF(check_out, check_in)) as amount'),
                DB::raw('SUM((daily_price * DATEDIFF(check_out, check_in)) * (channels.commission / 100)) as commission_amount')
            )
            ->groupBy('channels.id', 'channels.name', 'channels.color', 'channels.commission')
            ->get();

        $totalCount = $data->sum('count');

        return $data->map(function ($item) use ($totalCount) {
            return [
                'name' => $item->name,
                'color' => $item->color,
                'count' => (int) $item->count,
                'percentage' => $totalCount > 0 ? round(($item->count / $totalCount) * 100, 1) : 0,
                'amount' => (float) $item->amount,
                'commission' => (float) $item->commission,
                'commission_amount' => (float) $item->commission_amount,
            ];
        })->toArray();
    }

    // ────────────────────────────────────────────────
    //  Expenses
    // ────────────────────────────────────────────────
    public function getExpensesAmountByPeriod(Carbon $start, Carbon $end): float
    {
        return (float) Expense::query()
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->sum('amount');
    }

    // ────────────────────────────────────────────────
    //  Orders
    // ────────────────────────────────────────────────
    public function getOrdersCountByPeriod(Carbon $start, Carbon $end): int
    {
        return Order::query()
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->count();
    }

    public function getOrdersAmountByPeriod(Carbon $startDate, Carbon $endDate): float
    {
        return (float) (Order::query()
            ->join('order_items', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.date', [$startDate->toDateString(), $endDate->toDateString()])
            ->select(DB::raw('SUM(order_items.quantity * order_items.price) as total'))
            ->value('total') ?? 0);
    }
}
