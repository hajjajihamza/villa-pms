<?php

declare(strict_types=1);

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Models\Channel;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanningController extends Controller
{
    public function index(Request $request): Response
    {
        // Get the requested date, default to today
        $date = $request->input('date') ? Carbon::parse($request->input('date')) : Carbon::today();

        // Ensure we start at the beginning of the week (e.g., Monday)
        $startOfWeek = $date->copy()->startOfWeek();
        $endOfWeek = $date->copy()->endOfWeek();

        // Fetch units with their accommodations and reservations that overlap with the week
        $units = Unit::with(['accommodations.reservations' => function ($query) use ($startOfWeek, $endOfWeek) {
            $query->where(function ($q) use ($startOfWeek, $endOfWeek) {
                // Reservation overlaps with the week if:
                // Check-in is before the week ends AND check-out is after the week starts
                $q->where('check_in', '<=', $endOfWeek)
                    ->where('check_out', '>=', $startOfWeek);
            })->with(['accommodation.units', 'channel', 'creator', 'visitors.documents', 'orders.orderItems']); // Eager load for full reservation details
        }])->get();

        // Flatten the reservations out to the unit level
        $unitsData = $units->map(function ($unit) {
            return [
                'id' => $unit->id,
                'name' => $unit->name,
                'accommodations' => $unit->accommodations,
                'reservations' => $unit->reservations,
            ];
        });

        // We also need channels and accommodations for the reservation form
        $channels = Channel::all();
        $accommodations = Accommodation::with('units:id')->get();

        return Inertia::render('planning/index', [
            'date' => $startOfWeek->toDateString(), // start of the current displayed week
            'units' => $unitsData,
            'channels' => $channels,
            'accommodations' => $accommodations,
            'unitsData' => Unit::all(),
        ]);
    }
}
