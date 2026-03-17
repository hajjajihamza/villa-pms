<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Unit extends Model
{
    // ────────────────────────────────────────────────
    //  Table, Key & Mass Assignment
    // ────────────────────────────────────────────────

    /** @var array<int, string> */
    protected $fillable = [
        'name',
    ];

    protected $appends = [
        'reserved_periods',
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

    protected function reservations(): Attribute
    {
        return Attribute::get(function () {
            return $this->accommodations()
                ->with(['reservations.visitors.documents','reservations.channel','reservations.orders.orderItems', 'reservations.creator', 'reservations.accommodation'])
                ->get()
                ->pluck('reservations')
                ->flatten()
                ->unique('id')
                ->values();
        });
    }

    protected function reservedPeriods(): Attribute
    {
        return Attribute::get(function () {
            $today = Carbon::today();

            return $this->accommodations()
                ->with(['reservations' => function ($query) use ($today) {
                    $query->where('check_in', '>=', $today)
                        ->select(['id', 'accommodation_id', 'check_in', 'check_out']);
                }])
                ->get()
                ->pluck('reservations')
                ->flatten()
                ->map(fn ($reservation) => [
                    'check_in' => $reservation->check_in->toDateString(),
                    'check_out' => $reservation->check_out->toDateString(),
                ])
                ->values()
                ->toArray();
        });
    }

}
