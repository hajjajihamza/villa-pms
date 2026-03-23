<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Expense\ExpenseCategoryApiController;
use App\Http\Controllers\Api\Reservation\ReservationApiController;
use Illuminate\Support\Facades\Route;

Route::controller(ExpenseCategoryApiController::class)
    ->group(function () {
        Route::get('/expense-categories', 'index');
        Route::post('/expense-categories', 'store');
    });

Route::get('/booking-data', [ReservationApiController::class, 'bookingData']);
Route::get('/reservations/{reservation}', [ReservationApiController::class, 'show']);
