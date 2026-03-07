<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'date',
        'reservation_id',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    protected function totalAmount(): Attribute
    {
        return Attribute::get(function (): string {
            if ($this->relationLoaded('orderItems')) {
                $total = $this->orderItems->sum(fn (OrderItem $item): float => (float) $item->total);

                return number_format($total, 2, '.', '');
            }

            $total = $this->orderItems()
                ->selectRaw('COALESCE(SUM(quantity * price), 0) as total')
                ->value('total');

            return number_format((float) $total, 2, '.', '');
        });
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot([
                'id',
                'product_name',
                'quantity',
                'price',
                'created_by',
            ])
            ->withTimestamps();
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
