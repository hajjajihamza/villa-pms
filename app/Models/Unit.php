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

    // ────────────────────────────────────────────────
    //  Accessors & Mutators
    // ────────────────────────────────────────────────

    protected function reservedPeriods(): Attribute
    {
        return Attribute::get(function () {
            $date = Carbon::today()->subWeek();

            return DB::table('reservations')
                ->select('reservations.check_in', 'reservations.check_out')
                ->join('accommodations', 'accommodations.id', '=', 'reservations.accommodation_id')
                ->join('accommodation_unit', 'accommodation_unit.accommodation_id', '=', 'accommodations.id')
                ->where('check_in', '>=', $date)
                ->where('accommodation_unit.unit_id', $this->id)
                ->whereNull('reservations.deleted_at')
                ->get()
                ->toArray();
        });
    }
}
