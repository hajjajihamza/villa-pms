<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IcalReservation extends Model
{
    /** @var array<int, string> */
    protected $fillable = [
        'uid',
        'dtstart',
        'dtend',
        'ical_source_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dtstart' => 'datetime',
            'dtend' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<IcalSource, IcalReservation>
     */
    public function icalSource(): BelongsTo
    {
        return $this->belongsTo(IcalSource::class);
    }
}
