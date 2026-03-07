<?php
declare(strict_types=1);

namespace App\Models;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
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
