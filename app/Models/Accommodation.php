<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Accommodation extends Model
{
    // ────────────────────────────────────────────────
    //  Table, Key & Mass Assignment
    // ────────────────────────────────────────────────

    /** @var array<int, string> */
    protected $fillable = [
        'name',
        'daily_price',
        'max_adults',
        'max_children',
        'service_price',
        'color',
    ];

    /**
     * @return array<string, string|class-string|array>
     */
    protected function casts(): array
    {
        return [
            'daily_price' => 'decimal:2',
            'service_price' => 'decimal:2',
        ];
    }

    // ────────────────────────────────────────────────
    //  Relationships
    // ────────────────────────────────────────────────

    public function reservations(): BelongsToMany
    {
        return $this->belongsToMany(Reservation::class, 'accommodation_reservation');
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
            $date = Carbon::today()->subWeeks(2);

            return $this->reservations()
                ->select('check_in', 'check_out')
                ->where('check_in', '>=', $date)
                ->get()
                ->map(fn($data) => [
                    'check_in' => $data->check_in->format('Y-m-d'),
                    'check_out' => $data->check_out->format('Y-m-d'),
                ])
                ->toArray();
        });
    }
}
