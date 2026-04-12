<?php

namespace App\Services\Reservation;

use App\Models\IcalReservation;
use App\Models\Reservation;
use App\Models\Unit;
use Carbon\Carbon;

class PlanningService
{
    public function getPlanningData(Carbon $startDate, Carbon $endDate): array
    {
        return Unit::all()->map(function($unit) use ($startDate, $endDate) {
            $reservations = Reservation::query()
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
                ->toArray();

            $icalResevations = IcalReservation::query()
                ->with(['icalSource', 'icalSource.unit', 'icalSource.channel'])
                ->whereRelation('icalSource', 'unit_id', $unit->id)
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->where('dtstart', '<=', $endDate)
                        ->where('dtend', '>=', $startDate);
                })
                ->get()
                // simple DTO
                ->map(function ($icalReservation) {
                    return [
                        'id' => $icalReservation->id,
                        'check_in' => $icalReservation->dtstart,
                        'check_out' => $icalReservation->dtend,
                        'main_visitor' => [
                            'full_name' => 'Réserver par '.$icalReservation->icalSource->channel->name,
                        ],
                        'accommodation' => [
                            'color' => $icalReservation->icalSource->channel->color,
                        ],
                        'is_external' => true
                    ];
                })->toArray()
                ;
            return [
                'id' => $unit->id,
                'name' => $unit->name,
                'reservations' => array_merge($reservations, $icalResevations)
            ];
        })->toArray();
    }
}
