<?php

namespace App\Models;

use App\Enums\DocTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{

    protected $fillable = [
        'file_path',
        'type',
        'visitor_id',
    ];

    protected function casts(): array
    {
        return [
            'type' => DocTypeEnum::class,
        ];
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }
}

