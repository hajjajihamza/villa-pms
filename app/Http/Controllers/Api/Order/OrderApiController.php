<?php

namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;


class OrderApiController extends Controller
{
    public function index(Request $request)
    {
        $perPage = 12;
        $orders = null;
        $query = Order::query()
            ->with(['reservation.mainVisitor', 'reservation.accommodation', 'orderItems'])
            ->when($request->accommodation_id, function (Builder $query, int $accommodationId) {
                $query->whereHas('reservation.accommodation', function (Builder $q) use ($accommodationId) {
                    $q->where('id', $accommodationId);
                });
            })
            ->latest();

        if ($request->filled('search')) {
            $search = strtolower($request->search);

            $filtredList = $query->get()->filter(function ($order) use ($search) {
                $visitor = $order->reservation->mainVisitor ?? null;

                if (!$visitor) {
                    return false;
                }

                return str_contains(strtolower($visitor->full_name), $search) || str_contains(strtolower($visitor->phone), $search);
            })->values(); 

            // Step 3: Manual pagination
            $page = LengthAwarePaginator::resolveCurrentPage();

            $orders = new LengthAwarePaginator(
                $filtredList->forPage($page, $perPage),
                $filtredList->count(),
                $perPage,
                $page,
                ['path' => request()->url(), 'query' => request()->query()]
            ); 
        } else {
            $orders = $query
            ->paginate($perPage)
            ->withQueryString();
        }

        return response()->json([
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }
}
