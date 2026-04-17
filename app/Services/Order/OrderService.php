<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Get paginated orders with filters.
     */
    public function getPaginatedOrders(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        $query = Order::query()
            ->with(['reservation.mainVisitor', 'reservation.accommodations', 'orderItems'])
            ->when($filters['accommodation_id'] ?? null, function (Builder $query, int $accommodationId) {
                $query->whereHas('reservation.accommodations', function (Builder $q) use ($accommodationId) {
                    $q->where('id', $accommodationId);
                });
            })
            ->when($filters['date'] ?? null, function (Builder $query, $date) {
                $query->whereDate('date', $date);
            })
            ->orderByDesc('date');

        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);

            $filtredList = $query->get()->filter(function ($order) use ($search) {
                $visitor = $order->reservation->mainVisitor ?? null;

                if (!$visitor) {
                    return false;
                }

                return str_contains(strtolower($visitor->full_name), $search) || str_contains(strtolower($visitor->phone ?? ''), $search);
            })->values();

            $page = LengthAwarePaginator::resolveCurrentPage();

            return new LengthAwarePaginator(
                $filtredList->forPage($page, $perPage),
                $filtredList->count(),
                $perPage,
                $page,
                ['path' => request()->url(), 'query' => request()->query()]
            );
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Store a newly created order.
     */
    public function storeOrder(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $order = Order::create([
                'reservation_id' => $data['reservation_id'] ?? null,
                'date' => Carbon::parse($data['date'])->setTimeFromTimeString(now()->toTimeString())->toDateTimeString(),
            ]);

            foreach ($data['order_items'] as $item) {
                $order->orderItems()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'created_by' => auth()->id(),
                ]);
            }

            return $order;
        });
    }

    /**
     * Update the quantity of an order item.
     */
    public function updateOrderItemQuantity(OrderItem $orderItem, int $quantity): bool
    {
        return $orderItem->update([
            'quantity' => $quantity,
        ]);
    }

    /**
     * Delete an order item.
     */
    public function deleteOrderItem(OrderItem $orderItem): bool
    {
        return $orderItem->delete();
    }
}
