<?php
declare(strict_types=1);

namespace App\Models;

use App\Enums\DocTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    // ────────────────────────────────────────────────
    //  Table, Key & Mass Assignment
    // ────────────────────────────────────────────────

    /** @var array<int, string> */
    protected $fillable = [
        'file_path',
        'type',
        'visitor_id',
    ];

    /**
     * @return array<string, string|class-string|array>
     */
    protected function casts(): array
    {
        return [
            'type' => DocTypeEnum::class,
        ];
    }

    // ────────────────────────────────────────────────
    //  Relationships
    // ────────────────────────────────────────────────

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }
}
