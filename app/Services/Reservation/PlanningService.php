<?php

namespace App\Services\Reservation;

use App\Models\Accommodation;
use Carbon\Carbon;

class PlanningService
{
    public function getPlanningData(Carbon $startDate, Carbon $endDate): array
    {
        return Accommodation::all()->map(function($accommodation) use ($startDate, $endDate) {
            $reservations = $accommodation
                ->reservations()
                ->with(['mainVisitor', 'channel'])
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->where('reservations.check_in', '<=', $endDate)
                        ->where('reservations.check_out', '>=', $startDate);
                })
                ->get()
                ->toArray();

            return [
                'id' => $accommodation->id,
                'name' => $accommodation->name,
                'color' => $accommodation->color,
                'reservations' => $reservations
            ];
        })->toArray();
    }
}
