<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    // ────────────────────────────────────────────────
    //  Traits
    // ────────────────────────────────────────────────

    use SoftDeletes;

    // ────────────────────────────────────────────────
    //  Table, Key & Mass Assignment
    // ────────────────────────────────────────────────

    /** @var array<int, string> */
    protected $fillable = [
        'product_name',
        'quantity',
        'price',
        'order_id',
        'product_id',
        'created_by',
    ];

    protected $appends = ['total'];

    /**
     * @return array<string, string|class-string|array>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    // ────────────────────────────────────────────────
    //  Relationships
    // ────────────────────────────────────────────────

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ────────────────────────────────────────────────
    //  Accessors & Mutators
    // ────────────────────────────────────────────────

    protected function total(): Attribute
    {
        return Attribute::get(function (): string {
            $total = (float) $this->quantity * (float) $this->price;

            return number_format($total, 2, '.', '');
        });
    }
}
