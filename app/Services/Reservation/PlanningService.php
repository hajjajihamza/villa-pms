<?php

namespace App\Services\Reservation;

use App\Models\Reservation;
use App\Models\Unit;
use Carbon\Carbon;

class PlanningService
{
    public function getPlanningData(Carbon $startDate, Carbon $endDate): array
    {
        return Unit::all()->map(fn($unit) => [
            'id' => $unit->id,
            'name' => $unit->name,
            'reservations' => Reservation::query()
                ->with(['mainVisitor', 'accommodation'])
                ->select('reservations.*')
                ->join('accommodations', 'accommodations.id', '=', 'reservations.accommodation_id')
                ->join('accommodation_unit', 'accommodation_unit.accommodation_id', '=', 'accommodations.id')
                ->where('accommodation_unit.unit_id', $unit->id)
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->where('reservations.check_in', '<=', $endDate)
                        ->where('reservations.check_out', '>=', $startDate);
                })
                ->get()
                ->toArray()
        ])->toArray();
    }
}
