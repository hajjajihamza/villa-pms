<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{

    protected $fillable = [
        'name',
        'amount',
        'date',
        'description',
        'created_by',
        'category_id',
        'unit_id',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'date' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    #[Scope]
    protected function thisMonth(Builder $query): void
    {
        $query
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month);
    }

    #[Scope]
    protected function thisYear(Builder $query): void
    {
        $query->whereYear('date', now()->year);
    }
}

