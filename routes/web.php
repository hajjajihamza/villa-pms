<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Expense\ExpenseController;
use App\Http\Controllers\Reservation\ReservationController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])
    ->middleware('auth')
    ->name('dashboard');

Route::middleware('auth')->group(function (): void {
    // ────────────────────────────────────────────────
    //  Expenses
    // ────────────────────────────────────────────────
    Route::resource('expenses', ExpenseController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // ────────────────────────────────────────────────
    //  Reservations
    // ────────────────────────────────────────────────
    Route::get('reservations/departures', [ReservationController::class, 'departures'])->name('reservations.departures');
    Route::get('reservations/archive', [ReservationController::class, 'archive'])->name('reservations.archive');
    Route::get('reservations/stay-overs', [ReservationController::class, 'stayOvers'])->name('reservations.stay-overs');

    Route::patch('reservations/{reservation}/reported', [ReservationController::class, 'toggleReported'])
        ->name('reservations.reported');
    Route::patch('reservations/{reservation}/validate', [ReservationController::class, 'validateStay'])
        ->name('reservations.validate');
    Route::post('reservations/{reservation}/visitors', [ReservationController::class, 'storeVisitor'])
        ->name('reservations.visitors.store');
    Route::resource('reservations', ReservationController::class)
        ->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
