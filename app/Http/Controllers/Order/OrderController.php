<?php
declare(strict_types=1);

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Store a newly created order in storage.
     */
    public function store(StoreOrderRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $order = Order::create([
                'reservation_id' => $request->integer('reservation_id') ?: null,
                'date' => now(),
            ]);

            foreach ($request->input('order_items') as $item) {
                $order->orderItems()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'created_by' => auth()->id(),
                ]);
            }
        });

        return back()->with('success', 'Commande validée avec succès.');
    }

    /**
     * Display a listing of the orders.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with(['reservation.mainVisitor', 'reservation.accommodation', 'orderItems'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->whereHas('reservation.mainVisitor', function ($q) use ($search): void {
                $q->where('full_name', 'like', "%{$search}%");
            })->orWhereHas('reservation.accommodation', function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate($request->integer('per_page', 10));

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
            ],
        ]);
    }

    /**
     * Update the specified order item.
     */
    public function updateItem(Request $request, OrderItem $orderItem): JsonResponse
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $orderItem->update([
            'quantity' => $request->integer('quantity'),
        ]);

        return response()->json(['message' => 'Quantité mise à jour avec succès.']);
    }

    /**
     * Remove the specified order item from storage.
     */
    public function destroyItem(OrderItem $orderItem): JsonResponse
    {
        $orderItem->delete();

        return response()->json(['message' => 'Article supprimé avec succès.']);
    }
}
