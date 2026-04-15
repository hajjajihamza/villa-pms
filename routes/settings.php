<?php

use App\Http\Controllers\Settings\AccommodationController;
use App\Http\Controllers\Settings\ChannelController;
use App\Http\Controllers\Settings\IcalSourceController;
use App\Http\Controllers\Settings\SettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    // ────────────────────────────────────────────────
    //  Settings
    // ────────────────────────────────────────────────
    Route::get('/settings', [SettingController::class, 'index'])
        ->name('settings.index');

    // ────────────────────────────────────────────────
    //  Accommodations
    // ────────────────────────────────────────────────
    Route::resource('accommodations', AccommodationController::class)
        ->only(['store', 'update', 'destroy']);
    // ────────────────────────────────────────────────
    //  iCal Sources
    // ────────────────────────────────────────────────
    Route::controller(IcalSourceController::class)->group(function () {
        Route::post('/accommodations/{accommodation}/ical-sources', 'store')->name('ical-sources.store');
        Route::delete('/ical-sources/{icalSource}', 'destroy')->name('ical-sources.destroy');
    });

    // ────────────────────────────────────────────────
    //  Channels
    // ────────────────────────────────────────────────
    Route::resource('channels', ChannelController::class)
        ->only(['store', 'update', 'destroy']);

    // ────────────────────────────────────────────────
    //  Profile
    // ────────────────────────────────────────────────
    Route::patch('settings/profile', [SettingController::class, 'updateProfile'])->name('profile.update');

    // ────────────────────────────────────────────────
    //  Password
    // ────────────────────────────────────────────────
    Route::put('settings/password', [SettingController::class, 'updatePassword'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');
});
