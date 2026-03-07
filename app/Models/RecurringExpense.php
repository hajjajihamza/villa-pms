<?php

namespace App\Models;

use App\Enums\FrequencyEnum;
use Illuminate\Database\Eloquent\Model;

class RecurringExpense extends Model
{

    protected $fillable = [
        'name',
        'amount',
        'frequency',
        'interval',
        'start_date',
        'end_date',
        'next_run_date',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'frequency' => FrequencyEnum::class,
            'start_date' => 'date',
            'end_date' => 'date',
            'next_run_date' => 'date',
        ];
    }
}

