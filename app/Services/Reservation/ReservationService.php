<?php

declare(strict_types=1);

namespace App\Services\Reservation;

use App\Models\Accommodation;
use App\Models\Document;
use App\Models\Reservation;
use App\Models\Visitor;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReservationService
{
    /**
     * Get reservations query based on request filters.
     *
     * @return Builder<Reservation>
     */
    public function getReservationsQuery(Builder $query, Request $request): Builder
    {
        return $query
            ->with(['accommodation', 'orders.orderItems', 'mainVisitor'])
            ->when($request->accommodation_id, function (Builder $query, int $accommodationId) {
                $query->where('accommodation_id', $accommodationId);
            })
            ->when($request->search, function (Builder $query, string $search) {
                $query->whereHas('visitors', function (Builder $q) use ($search) {
                    $q->whereLike('full_name', "%{$search}%")
                        ->orWhereLike('phone', "%{$search}%");
                });
            })
            ->when($request->date_from, function (Builder $query, string $dateFrom) {
                $query->where('check_in', '>=', $dateFrom);
            })
            ->when($request->date_to, function (Builder $query, string $dateTo) {
                $query->where('check_out', '<=', $dateTo);
            })
            ->orderBy('check_in');
    }

    /**
     * Create a new reservation and its main visitor.
     */
    public function createReservation(array $data): Reservation
    {
        return DB::transaction(function () use ($data) {
            $accommodation = Accommodation::findOrFail($data['accommodation_id']);

            $duration = (int) Carbon::parse($data['check_in'])->diffInDays(Carbon::parse($data['check_out']));
            $dailyPrice = (float) $data['total'] / ($duration ?: 1);

            $reservationData = [
                'check_in' => $data['check_in'],
                'check_out' => $data['check_out'],
                'adults' => $data['adults'],
                'children' => $data['children'],
                'advance_amount' => $data['advance_amount'],
                'daily_price' => $dailyPrice,
                'service_price' => $accommodation->service_price,
                'channel_id' => $data['channel_id'],
                'accommodation_id' => $accommodation->id,
                'created_by' => auth()->id(),
            ];

            $reservation = Reservation::create($reservationData);

            $mainVisitor = $reservation->visitors()->create([
                'full_name' => $data['full_name'],
                'phone' => $data['phone'],
                'country' => $data['country'],
                'is_main' => true,
            ]);

            if (isset($data['documents']) && is_array($data['documents'])) {
                foreach ($data['documents'] as $docData) {
                    if (isset($docData['file']) && $docData['file'] instanceof \Illuminate\Http\UploadedFile) {
                        $path = $docData['file']->store('visitor-documents', 'public');
                        $mainVisitor->documents()->create([
                            'type' => $docData['type'],
                            'file_path' => $path,
                        ]);
                    }
                }
            }

            return $reservation;
        });
    }

    /**
     * Update an existing reservation and its main visitor.
     */
    public function updateReservation(Reservation $reservation, array $data): Reservation
    {
        return DB::transaction(function () use ($reservation, $data) {
            $accommodation = Accommodation::findOrFail($data['accommodation_id']);

            $duration = (int) Carbon::parse($data['check_in'])->diffInDays(Carbon::parse($data['check_out']));
            $dailyPrice = (float) $data['total'] / ($duration ?: 1);

            $reservationData = [
                'check_in' => $data['check_in'],
                'check_out' => $data['check_out'],
                'adults' => $data['adults'],
                'children' => $data['children'],
                'advance_amount' => $data['advance_amount'],
                'daily_price' => $dailyPrice,
                'service_price' => $accommodation->service_price,
                'channel_id' => $data['channel_id'],
                'accommodation_id' => $accommodation->id,
            ];

            $reservation->update($reservationData);

            $mainVisitor = $reservation->visitors()->where('is_main', true)->first();
            if ($mainVisitor) {
                $mainVisitor->update([
                    'full_name' => $data['full_name'],
                    'phone' => $data['phone'],
                    'country' => $data['country'],
                ]);

                if (isset($data['documents']) && is_array($data['documents'])) {
                    foreach ($data['documents'] as $docData) {
                        if (isset($docData['file']) && $docData['file'] instanceof \Illuminate\Http\UploadedFile) {
                            $path = $docData['file']->store('visitor-documents', 'public');
                            if (isset($docData['id'])) {
                                $existingDoc = $mainVisitor->documents()->find($docData['id']);
                                if ($existingDoc) {
                                    if (Storage::disk('public')->exists($existingDoc->file_path)) {
                                        Storage::disk('public')->delete($existingDoc->file_path);
                                    }
                                    $existingDoc->update([
                                        'type' => $docData['type'],
                                        'file_path' => $path,
                                    ]);
                                    continue;
                                }
                            }

                            $mainVisitor->documents()->create([
                                'type' => $docData['type'],
                                'file_path' => $path,
                            ]);
                        } elseif (isset($docData['id'])) {
                            $existingDoc = $mainVisitor->documents()->find($docData['id']);
                            if ($existingDoc && $existingDoc->type !== $docData['type']) {
                                $existingDoc->update(['type' => $docData['type']]);
                            }
                        }
                    }
                }
            }

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
