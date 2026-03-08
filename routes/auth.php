<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::controller(AuthController::class)
    ->group(function (): void {
        Route::middleware('guest')
            ->group(function (): void {
                Route::get('/login', 'showLoginForm')->name('login');
                Route::post('/login', 'login')->name('login.store');
            });

        Route::middleware('auth')
            ->group(function (): void {
                Route::post('/logout', 'logout')->name('logout');
            });
    });
