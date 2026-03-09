<?php

use App\Http\Controllers\Settings\Accommodation\AccommodationController;
use App\Http\Controllers\Settings\Channel\ChannelController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/settings', [SettingController::class, 'index'])
        ->name('settings.index');

    Route::resource('accommodations', AccommodationController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('channels', ChannelController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});
