<?php

declare(strict_types=1);

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\StoreReservationRequest;
use App\Models\Accommodation;
use App\Models\Channel;
use App\Models\Reservation;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->renderReservations(Reservation::arrivals(), activeTab: 'arrivals', request: $request);
    }

    public function departures(Request $request): Response
    {
        return $this->renderReservations(Reservation::departures(), 'departures', $request);
    }

    public function archive(Request $request): Response
    {
        return $this->renderReservations(Reservation::archive(), 'archive', $request);
    }

    public function stayOvers(Request $request): Response
    {
        return $this->renderReservations(Reservation::stayOvers(), 'stay-overs', $request);
    }

    protected function renderReservations(Builder $query, string $activeTab, Request $request): Response
    {
        $reservations = $query
            ->with(['accommodation.units', 'channel', 'creator', 'visitors', 'orders.orderItems'])
            ->when($request->accommodation_id, function ($query, $accommodationId) {
                $query->where('accommodation_id', $accommodationId);
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('visitors', function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query->where('full_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
                });
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                $query->whereDate('check_in', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                $query->whereDate('check_out', '<=', $dateTo);
            })
            ->orderBy('check_in')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('reservations/index', [
            'reservations' => $reservations,
            'channels' => Channel::all(),
            'accommodations' => Accommodation::with('units:id')->get(),
            'activeTab' => $activeTab,
            'units' => Unit::all(),
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

        return redirect()->back()->with('success', 'Réservation créée avec succès.');
    }

    public function update(StoreReservationRequest $request, Reservation $reservation): RedirectResponse
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
            'daily_price' =>  $dailyPrice,
            'service_price' => $accommodation->service_price,
            'channel_id' => $validatedData['channel_id'],
            'accommodation_id' => $accommodation->id,
            'created_by' => auth()->id(),
        ];

        $reservation->update($reservationData);

        $mainVisitor = $reservation->visitors->firstWhere('is_main', true);
        if ($mainVisitor) {
            $mainVisitor->update([
                'full_name' => $validatedData['full_name'],
                'phone' => $validatedData['phone'],
                'country' => $validatedData['country'],
            ]);
        }

        return redirect()->back()->with('success', 'Réservation mise à jour avec succès.');
    }

    public function destroy(Reservation $reservation, Request $request): RedirectResponse
    {
        if ($request->deleted_note) {
            $reservation->update([
                'deleted_note' => $request->deleted_note,
            ]);
        }

        $reservation->delete();

        return redirect()->back()->with('success', 'Réservation supprimée avec succès.');
    }

    public function toggleReported(Reservation $reservation): RedirectResponse
    {
        $reservation->update([
            'reported' => ! $reservation->reported,
        ]);

        return redirect()->back()->with('success', 'Statut de la réservation mis à jour.');
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

        return redirect()->back()->with('success', 'Séjour validé avec succès.');
    }
}
