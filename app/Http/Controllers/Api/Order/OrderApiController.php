<?php

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\OrderItem;
use App\Services\Order\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderApiController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderService->getPaginatedOrders($request->all());

        return response()->json([
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
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

        $this->orderService->updateOrderItemQuantity($orderItem, $request->integer('quantity'));

        return response()->json(['message' => 'Quantité mise à jour avec succès.']);
    }

    /**
     * Remove the specified order item from storage.
     */
    public function destroyItem(OrderItem $orderItem): JsonResponse
    {
        $this->orderService->deleteOrderItem($orderItem);

        return response()->json(['message' => 'Article supprimé avec succès.']);
    }
}

