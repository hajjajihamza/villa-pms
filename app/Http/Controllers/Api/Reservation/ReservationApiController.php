<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Models\Channel;
use App\Models\Reservation;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;

class ReservationApiController extends Controller
{
    /**
     * Return data for creating a reservation.
     *
     * @return JsonResponse
     */
    public function bookingData(): JsonResponse
    {
        return response()->json([
            'channels' => Channel::all(),
            'accommodations' => Accommodation::with('units:id')->get(),
            'units' => Unit::all()->append('reserved_periods'),
        ]);
    }

    /**
     * Return detailed reservation data.
     *
     * @param Reservation $reservation
     * @return JsonResponse
     */
    public function show(Reservation $reservation): JsonResponse
    {
        $reservation->load([
            'accommodation',
            'channel',
            'mainVisitor',
            'visitors.documents',
            'orders.orderItems',
            'creator',
        ]);

        return response()->json($reservation->toResource());
    }
}
