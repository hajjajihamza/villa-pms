<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Channel extends Model
{
    // ────────────────────────────────────────────────
    //  Table, Key & Mass Assignment
    // ────────────────────────────────────────────────

    /** @var array<int, string> */
    protected $fillable = [
        'name',
        'commission',
        'color'
    ];

    /**
     * @return array<string, string|class-string|array>
     */
    protected function casts(): array
    {
        return [
            'commission' => 'decimal:2',
        ];
    }

    // ────────────────────────────────────────────────
    //  Relationships
    // ────────────────────────────────────────────────

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function units(): BelongsToMany
    {
        return $this->belongsToMany(Unit::class, 'ical_sources')
            ->withPivot('url')
            ->withTimestamps();
    }

    public function icalSources(): HasMany
    {
        return $this->hasMany(IcalSource::class);
    }
}
