<?php

declare(strict_types=1);

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\StoreReservationRequest;
use App\Http\Requests\Reservation\UpdateReservationRequest;
use App\Models\Accommodation;
use App\Models\Channel;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Reservation::query()
            ->with(['accommodation', 'channel', 'creator', 'visitors'])
            ->latest('check_in');

        return Inertia::render('reservations/index', [
            'reservations' => $query
                ->paginate(12)
                ->withQueryString(),
            'channels' => Channel::all(),
            'accommodations' => Accommodation::all(),
        ]);
    }

    public function store(StoreReservationRequest $request): RedirectResponse
    {
        $validatedData = $request->validated();

        $accommodation = Accommodation::query()->findOrFail($validatedData['accommodation_id']);

        $duration = (int) Carbon::parse($validatedData['check_in'])->diffInDays(Carbon::parse($validatedData['check_out']));
        $dailyPrice = (float) $validatedData['total'] / $duration;
        $reservationData = [
            'check_in' => $validatedData['check_in'],
            'check_out' => $validatedData['check_out'],
            'adults' => $validatedData['adults'],
            'children' => $validatedData['children'],
            'advance_amount' => $validatedData['advance_amount'],
            'daily_price' => $dailyPrice,
            'service_price' => $accommodation->service_price,
            'channel_id' => $validatedData['channel_id'],
            'accommodation_id' => $accommodation->id,
            'created_by' => auth()->id(),
        ];

        $reservation = Reservation::create($reservationData);
        $reservation->visitors()->create([
            'full_name' => $validatedData['full_name'],
            'phone' => $validatedData['phone'],
            'country' => $validatedData['country'],
            'is_main' => true,
        ]);

        return to_route('reservations.index');
    }

    public function update(UpdateReservationRequest $request, Reservation $reservation): RedirectResponse
    {
        $reservation->update([
            ...$request->validated(),
            'children' => (int) ($request->validated()['children'] ?? 0),
            'advance_amount' => (float) ($request->validated()['advance_amount'] ?? 0),
            'daily_price' => (float) ($request->validated()['daily_price'] ?? 0),
            'service_price' => (float) ($request->validated()['service_price'] ?? 0),
        ]);

        return to_route('reservations.index');
    }

    public function destroy(Reservation $reservation, Request $request): RedirectResponse
    {
        if ($request->deleted_note) {
            $reservation->update([
                'deleted_note' => $request->deleted_note,
            ]);
        }

        $reservation->delete();

        return to_route('reservations.index');
    }

    public function toggleReported(Reservation $reservation): RedirectResponse
    {
        $reservation->update([
            'reported' => ! $reservation->reported,
        ]);

        return to_route('reservations.index');
    }

    public function validateStay(Reservation $reservation): RedirectResponse
    {
        $today = Carbon::today();

        abort_unless(
            $today->betweenIncluded(
                Carbon::parse($reservation->check_in),
                Carbon::parse($reservation->check_out),
            ),
            422,
            'Reservation cannot be validated outside the stay period.',
        );

        $reservation->update([
            'real_check_in' => $today,
            'real_check_out' => $reservation->check_out,
        ]);

        return to_route('reservations.index');
    }
}
