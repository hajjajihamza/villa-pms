<?php

declare(strict_types=1);

namespace App\Services\Reservation;

use App\Models\Accommodation;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ReservationService
{
    /**
     * Get reservations query based on request filters.
     *
     * @return LengthAwarePaginator<Reservation>
     */
    public function getPaginatedReservations(Builder $query, array $filters, int $perPage = 12): LengthAwarePaginator
    {
        $query->with(['accommodations', 'orders.orderItems', 'mainVisitor', 'advances'])
            ->when($filters['accommodation_id'] ?? null, function (Builder $query, int $accommodationId) {
                $query->whereHas('accommodations', function (Builder $query) use ($accommodationId) {
                    $query->where('accommodations.id', $accommodationId);
                });
            })
            ->when($filters['date_from'] ?? null, function (Builder $query, string $dateFrom) {
                $query->where('check_in', '>=', $dateFrom);
            })
            ->when($filters['date_to'] ?? null, function (Builder $query, string $dateTo) {
                $query->where('check_out', '<=', $dateTo);
            })
            ->orderBy('check_in');

        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);

            $filtredList = $query->get()->filter(function (Reservation $reservation) use ($search) {
                $visitor = $reservation->mainVisitor ?? null;

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
     * Create a new reservation and its main visitor.
     */
    public function createReservation(array $data): Reservation
    {
        return DB::transaction(function () use ($data) {
            $service_price = Accommodation::whereIn('id', $data['accommodation_ids'])->sum('service_price');

            $duration = (int) Carbon::parse($data['check_in'])->diffInDays(Carbon::parse($data['check_out']));
            $dailyPrice = (float) $data['total'] / ($duration ?: 1);

            $reservationData = [
                'check_in' => $data['check_in'],
                'check_out' => $data['check_out'],
                'adults' => $data['adults'],
                'children' => $data['children'],
                'daily_price' => $dailyPrice,
                'service_price' => $service_price,
                'channel_id' => $data['channel_id'],
                'created_by' => auth()->id(),
            ];

            $reservation = Reservation::create($reservationData);

            $reservation->accommodations()->attach($data['accommodation_ids']);

             $reservation->visitors()->create([
                'full_name' => $data['full_name'],
                'phone' => $data['phone'],
                'country' => $data['country'],
                'is_main' => true,
            ]);

            return $reservation;
        });
    }

    /**
     * Update an existing reservation and its main visitor.
     */
    public function updateReservation(Reservation $reservation, array $data): Reservation
    {
        return DB::transaction(function () use ($reservation, $data) {
            $service_price = Accommodation::whereIn('id', $data['accommodation_ids'])->sum('service_price');

            $duration = (int) Carbon::parse($data['check_in'])->diffInDays(Carbon::parse($data['check_out']));
            $dailyPrice = (float) $data['total'] / ($duration ?: 1);

            $reservationData = [
                'check_in' => $data['check_in'],
                'check_out' => $data['check_out'],
                'adults' => $data['adults'],
                'children' => $data['children'],
                'daily_price' => $dailyPrice,
                'service_price' => $service_price,
                'channel_id' => $data['channel_id'],
            ];

            $reservation->update($reservationData);

            $visitorData =[
                'full_name' => $data['full_name'],
                'phone' => $data['phone'],
                'country' => $data['country'],
            ];

            // Créer le visiteur principale si ne pas exist.
            $mainVisitor = $reservation->mainVisitor()->first();

            if ($mainVisitor) {
                $mainVisitor->update($visitorData);
            } else {
                $reservation->visitors()->create([...$visitorData, 'is_main' => true]);
            }

            $reservation->accommodations()->sync($data['accommodation_ids']);

            return $reservation;
        });
    }

    /**
     * Delete a reservation.
     */
    public function deleteReservation(Reservation $reservation, ?string $deletedNote = null): void
    {
        if ($deletedNote) {
            $reservation->update([
                'deleted_note' => $deletedNote,
            ]);
        }

        $reservation->delete();
    }

    /**
     * Toggle the reported status of a reservation.
     */
    public function toggleReported(Reservation $reservation): Reservation
    {
        $reservation->update([
            'reported' => !$reservation->reported,
        ]);

        return $reservation;
    }



    /**
     * Validate the stay period of a reservation.
     */
    public function validateStay(Reservation $reservation): Reservation
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

        return $reservation;
    }

}
