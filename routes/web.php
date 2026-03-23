<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Expense\ExpenseController;
use App\Http\Controllers\Reservation\ReservationController;
use App\Http\Controllers\Reservation\PlanningController;
use App\Http\Controllers\Reservation\VisitorController;
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
    //  Planning
    // ────────────────────────────────────────────────
    Route::get('planning', [PlanningController::class, 'index'])->name('planning.index');


    // ────────────────────────────────────────────────
    //  Reservations
    // ────────────────────────────────────────────────
    Route::get('reservations/departures', [ReservationController::class, 'departures'])->name('reservations.departures');
    Route::get('reservations/archive', [ReservationController::class, 'archive'])->name('reservations.archive');
    Route::get('reservations/stay-overs', [ReservationController::class, 'stayOvers'])->name('reservations.stay-overs');
    Route::get('reservations/all', [ReservationController::class, 'all'])->name('reservations.all');

    Route::patch('reservations/{reservation}/reported', [ReservationController::class, 'toggleReported'])
        ->name('reservations.reported');
    Route::patch('reservations/{reservation}/validate', [ReservationController::class, 'validateStay'])
        ->name('reservations.validate');
    Route::post('reservations/{reservation}/visitors', [VisitorController::class, 'storeVisitor'])
        ->name('reservations.visitors.store');
    Route::put('reservations/visitors/{visitor}', [VisitorController::class, 'updateVisitor'])
        ->name('reservations.visitors.update');
    Route::delete('reservations/visitors/{visitor}', [VisitorController::class, 'destroyVisitor'])
        ->name('reservations.visitors.destroy');

    Route::post('reservations/visitors/{visitor}/documents', [VisitorController::class, 'storeDocument'])
        ->name('reservations.documents.store');
    Route::put('reservations/documents/{document}', [VisitorController::class, 'updateDocument'])
        ->name('reservations.documents.update');
    Route::delete('reservations/documents/{document}', [VisitorController::class, 'destroyDocument'])
        ->name('reservations.documents.destroy');
    Route::resource('reservations', ReservationController::class)
        ->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
