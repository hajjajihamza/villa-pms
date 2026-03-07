<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Accommodation extends Model
{
    protected $fillable = [
        'name',
        'daily_price',
        'max_adults',
        'max_children',
        'service_price',
        'color',
    ];

    protected function casts(): array
    {
        return [
            'daily_price' => 'decimal:2',
            'service_price' => 'decimal:2',
        ];
    }

    public function units(): BelongsToMany
    {
        return $this->belongsToMany(Unit::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}
