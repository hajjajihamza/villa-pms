<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Unit extends Model
{
    // ────────────────────────────────────────────────
    //  Table, Key & Mass Assignment
    // ────────────────────────────────────────────────

    /** @var array<int, string> */
    protected $fillable = [
        'name',
    ];

    // ────────────────────────────────────────────────
    //  Relationships
    // ────────────────────────────────────────────────

    public function accommodations(): BelongsToMany
    {
        return $this->belongsToMany(Accommodation::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function channels(): BelongsToMany
    {
        return $this->belongsToMany(Channel::class, 'ical_sources')
            ->withPivot('url')
            ->withTimestamps();
    }

    public function icalSources(): HasMany
    {
        return $this->hasMany(IcalSource::class);
    }

    // ────────────────────────────────────────────────
    //  Accessors & Mutators
    // ────────────────────────────────────────────────

    protected function reservedPeriods(): Attribute
    {
        return Attribute::get(function () {
            $date = Carbon::today()->subWeek();

            $reservationsDates = DB::table('reservations')
                ->select('reservations.check_in', 'reservations.check_out')
                ->join('accommodations', 'accommodations.id', '=', 'reservations.accommodation_id')
                ->join('accommodation_unit', 'accommodation_unit.accommodation_id', '=', 'accommodations.id')
                ->where('check_in', '>=', $date)
                ->where('accommodation_unit.unit_id', $this->id)
                ->whereNull('reservations.deleted_at')
                ->get()
                ->toArray();

            $iCalReservationsDates = DB::table('ical_reservations')
                ->select(
                    DB::raw('DATE_FORMAT(ical_reservations.dtstart, "%Y-%m-%d") as check_in'),
                    DB::raw('DATE_FORMAT(ical_reservations.dtend, "%Y-%m-%d") as check_out')
                )
                ->join('ical_sources', 'ical_sources.id', '=', 'ical_reservations.ical_source_id')
                ->where('dtstart' ,'>=' ,$date)
                ->where('ical_sources.unit_id', $this->id)
                ->get()
                ->toArray()
                ;
            return array_merge($reservationsDates, $iCalReservationsDates);
        });
    }
}
