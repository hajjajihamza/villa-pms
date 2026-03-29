<?php

namespace App\Services\Settings;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SettingService
{
    /**
     * Update the user's profile information.
     */
    public function updateProfile(User $user, array $data): bool
    {
        return $user->update([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
        ]);
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(User $user, string $password): bool
    {
        return $user->update([
            'password' => Hash::make($password),
        ]);
    }
}
