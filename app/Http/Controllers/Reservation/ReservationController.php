<?php

declare(strict_types=1);

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\StoreReservationRequest;
use App\Models\Accommodation;
use App\Models\Reservation;
use App\Services\Reservation\ReservationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $reservationService
    ) {}

    public function index(Request $request): Response
    {
        return $this->renderReservations(Reservation::arrivals(), 'arrivals', $request);
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

    public function all(Request $request): Response
    {
        return $this->renderReservations(Reservation::query(), 'all', $request);
    }

    protected function renderReservations(Builder $query, string $activeTab, Request $request): Response
    {
        $reservations = $this->reservationService->getReservationsQuery($query, $request)
            ->paginate(12)
            ->withQueryString()
            ->through(fn(Reservation $item) => $item->append(['duration', 'amount_to_pay']))
        ;

        return Inertia::render('reservations/index', [
            'reservations' => $reservations,
            'accommodations' => Accommodation::get(['id', 'name']),
            'activeTab' => $activeTab,
        ]);
    }

    public function store(StoreReservationRequest $request): RedirectResponse
    {
        $this->reservationService->createReservation($request->validated());

        return redirect()->back()->with('success', 'Réservation créée avec succès.');
    }

    public function update(StoreReservationRequest $request, Reservation $reservation): RedirectResponse
    {
        $this->reservationService->updateReservation($reservation, $request->validated());

        return redirect()->back()->with('success', 'Réservation mise à jour avec succès.');
    }

    public function destroy(Reservation $reservation, Request $request): RedirectResponse
    {
        $this->reservationService->deleteReservation($reservation, $request->deleted_note);

        return redirect()->back()->with('success', 'Réservation supprimée avec succès.');
    }

    public function toggleReported(Reservation $reservation): RedirectResponse
    {
        $this->reservationService->toggleReported($reservation);

        return redirect()->back()->with('success', 'Statut de la réservation mis à jour.');
    }


    public function validateStay(Reservation $reservation): RedirectResponse
    {
        try {
            $this->reservationService->validateStay($reservation);
        } catch (HttpException $e) {
            abort($e->getStatusCode(), $e->getMessage());
        }

        return redirect()->back()->with('success', 'Séjour validé avec succès.');
    }

}
