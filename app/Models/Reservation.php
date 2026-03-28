<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StatusEnum;
use Carbon\Carbon;
use Fruitcake\LaravelDebugbar\Facades\Debugbar;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
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
        'check_in',
        'check_out',
        'real_check_in',
        'real_check_out',
        'adults',
        'children',
        'reported',
        'advance_amount',
        'daily_price',
        'service_price',
        'deleted_note',
        'created_by',
        'channel_id',
        'accommodation_id',
    ];

    /**
     * @return array<string, string|class-string|array>
     */
    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'real_check_in' => 'datetime',
            'real_check_out' => 'datetime',
            'reported' => 'boolean',
            'advance_amount' => 'decimal:2',
            'total_price' => 'decimal:2',
            'service_price' => 'decimal:2',
            'daily_price' => 'decimal:2',
        ];
    }

    // ────────────────────────────────────────────────
    //  Relationships
    // ────────────────────────────────────────────────

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function mainVisitor(): HasOne
    {
        return $this->hasOne(Visitor::class, 'reservation_id', 'id')
            ->where('is_main', true);
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function accommodation(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class);
    }

    public function visitors(): HasMany
    {
        return $this->hasMany(Visitor::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    // ────────────────────────────────────────────────
    //  Accessors & Mutators
    // ────────────────────────────────────────────────

    protected function amountToPay(): Attribute
    {
        return Attribute::make(
            get: fn () => ((float) $this->total_price + $this->total_orders_amount) - (float) $this->advance_amount,
        );
    }

    protected function totalPrice(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->daily_price * $this->duration,
        );
    }

    protected function totalOrdersAmount(): Attribute
    {
        return Attribute::make(
            get: function (): float {
                $ordersTotal = 0.0;

                if ($this->relationLoaded('orders')) {
                    $ordersTotal = $this->orders->sum(fn (Order $order) => (float) $order->total_amount);
                } else {
                    $ordersTotal = (float) OrderItem::query()
                        ->whereHas('order', fn (Builder $query): Builder => $query->where('reservation_id', $this->id))
                        ->selectRaw('COALESCE(SUM(quantity * price), 0) as total')
                        ->value('total');
                }

                return $ordersTotal;
            }
        );
    }

    protected function guestsCount(): Attribute
    {
        return Attribute::get(
            fn (): int => (int) $this->adults + (int) $this->children
        );
    }

    protected function duration(): Attribute
    {
        return Attribute::get(function (): int {
            if ($this->real_check_in && $this->real_check_out) {
                return (int) Carbon::parse($this->real_check_in)->diffInDays(Carbon::parse($this->real_check_out));
            }

            if (! $this->check_in || ! $this->check_out) {
                return 0;
            }

            return (int) Carbon::parse($this->check_in)->diffInDays(Carbon::parse($this->check_out));
        });
    }

    protected function status(): Attribute
    {
        return Attribute::make(
            get: function (): StatusEnum {
                $today = Carbon::today();

                if ($this->trashed()) {
                    return StatusEnum::CANCELLED;
                }

                if ($this->real_check_in && $today->lte($this->real_check_out)) {
                    return StatusEnum::CONFIRMED;
                }

                if ($this->id === 10) {
                    Debugbar::debug($this->real_check_out, $today ,$today->gt(Carbon::parse($this->real_check_out)));
                }

                if ($this->real_check_out && $today->gt(Carbon::parse($this->real_check_out))) {
                    return StatusEnum::CHECKED_OUT;
                }

                return StatusEnum::PENDING;
            }
        );
    }

    protected function canValidate(): Attribute
    {
        return Attribute::make(
            get: fn () => Carbon::today()->betweenIncluded(Carbon::parse($this->check_in), Carbon::parse($this->check_out)),
        );
    }

    // ────────────────────────────────────────────────
    //  Local Scopes
    // ────────────────────────────────────────────────

    #[Scope]
    protected function confirmed(Builder $query): void
    {
        $query
            ->whereNotNull('real_check_in')
            ->where('real_check_out', '<', now()->toDateString());
    }

    #[Scope]
    protected function checkedOut(Builder $query): void
    {
        $query
            ->whereNotNull('real_check_in')
            ->where('real_check_out', '>=', now()->toDateString());
    }

    #[Scope]
    protected function reported(Builder $query): void
    {
        $query->where('reported', true);
    }

    #[Scope]
    protected function arrivals(Builder $query): void
    {
        $query->whereDate('check_in', '>=', Carbon::today())
            ->whereNull('real_check_in');
    }

    #[Scope]
    protected function departures(Builder $query): void
    {
        $query->whereDate('real_check_out', Carbon::today());
    }

    #[Scope]
    protected function requests(Builder $query): void
    {
        $query->whereDate('check_in', '>', Carbon::today())
            ->whereNull('real_check_in');
    }

    #[Scope]
    protected function archive(Builder $query): void
    {
        $query->onlyTrashed();
    }

    #[Scope]
    protected function stayOvers(Builder $query): void
    {
        $today = Carbon::today()->toDateTimeString();
        $query->whereNotNull('real_check_in')
            ->whereNotNull('real_check_out')
            ->where('real_check_in', '<=', $today)
            ->where('real_check_out', '>', $today);
    }
}
