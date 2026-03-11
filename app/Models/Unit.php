<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

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

    public function reservaions(): HasManyThrough
    {
        return $this->hasManyThrough(Reservation::class, Accommodation::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    // ────────────────────────────────────────────────
    //  Methods
    // ────────────────────────────────────────────────
    public function reservedDays(): array
    {
        $days = [];

        $reservations = Reservation::query()
            ->whereIn(
                'accommodation_id',
                $this->accommodations()->pluck('accommodations.id')
            )
            ->whereNull('deleted_at')
            ->get(['check_in', 'check_out']);

        foreach ($reservations as $reservation) {

            $start = Carbon::parse($reservation->check_in);
            $end = Carbon::parse($reservation->check_out);

            while ($start->lt($end)) {

                $days[] = $start->format('Y-m-d');

                $start->addDay();
            }
        }

        return array_values(array_unique($days));
    }
}
