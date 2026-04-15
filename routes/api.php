<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Expense\ExpenseCategoryApiController;
use App\Http\Controllers\Api\Ical\IcalSourceApiController;
use App\Http\Controllers\Api\Order\OrderApiController;
use App\Http\Controllers\Api\ProductCategoryApiController;
use App\Http\Controllers\Api\Reservation\ReservationApiController;
use App\Http\Controllers\Api\Statistic\DashboardStatisticsApiController;
use Illuminate\Support\Facades\Route;

// ────────────────────────────────────────────────
//  Expense Categories
// ────────────────────────────────────────────────
Route::controller(ExpenseCategoryApiController::class)
    ->group(function () {
        Route::get('/expense-categories', 'index');
        Route::post('/expense-categories', 'store');
    });

// ────────────────────────────────────────────────
//  Product Categories
// ────────────────────────────────────────────────
Route::post('/product-categories', [ProductCategoryApiController::class, 'store']);

// ────────────────────────────────────────────────
//  Reservations
// ────────────────────────────────────────────────
Route::get('/reservations/booking-data', [ReservationApiController::class, 'bookingData']);
Route::get('/reservations/{reservation}', [ReservationApiController::class, 'show']);

// ────────────────────────────────────────────────
//  Orders
// ────────────────────────────────────────────────
Route::get('/orders', [OrderApiController::class, 'index']);
Route::patch('/order-items/{orderItem}', [OrderApiController::class, 'updateItem']);
Route::delete('/order-items/{orderItem}', [OrderApiController::class, 'destroyItem']);

// ────────────────────────────────────────────────
//  Statistics
// ────────────────────────────────────────────────
Route::get('/statistics/dashboard', [DashboardStatisticsApiController::class, 'index']);

// ────────────────────────────────────────────────
//  iCal Sources
// ────────────────────────────────────────────────
Route::get('/{channel}/ical-sources', [IcalSourceApiController::class, 'index']);
