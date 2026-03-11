<?php
declare(strict_types=1);

namespace App\Models;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    // ────────────────────────────────────────────────
    //  Traits
    // ────────────────────────────────────────────────

    use Notifiable;

    // ────────────────────────────────────────────────
    //  Table, Key & Mass Assignment
    // ────────────────────────────────────────────────

    /** @var array<int, string> */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
    ];

    protected $appends = [
        'is_admin',
    ];

    /** @var array<int, string> */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string|class-string|array>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => RoleEnum::class,
        ];
    }

    // ────────────────────────────────────────────────
    //  Relationships
    // ────────────────────────────────────────────────

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'created_by');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'created_by');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'created_by');
    }
    
    // ────────────────────────────────────────────────
    //  Accessors & Mutators
    // ────────────────────────────────────────────────

    protected function isAdmin(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->role === RoleEnum::ADMIN,
        );
    }

    // ────────────────────────────────────────────────
    //  Local Scopes
    // ────────────────────────────────────────────────

    #[Scope]
    protected function admins(Builder $query): void
    {
        $query->where('role', RoleEnum::ADMIN);
    }

    #[Scope]
    protected function staff(Builder $query): void
    {
        $query->where('role', RoleEnum::STAFF);
    }
}
