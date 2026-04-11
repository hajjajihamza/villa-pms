<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IcalSource extends Model
{
    /** @var array<int, string> */
    protected $fillable = [
        'unit_id',
        'channel_id',
        'url',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    /**
     * @return HasMany<IcalReservation, IcalSource>
     */
    public function icalReservations(): HasMany
    {
        return $this->hasMany(IcalReservation::class);
    }
}
