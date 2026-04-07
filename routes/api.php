<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Expense\ExpenseCategoryApiController;
use App\Http\Controllers\Api\Order\OrderApiController;
use App\Http\Controllers\Api\ProductCategoryApiController;
use App\Http\Controllers\Api\Reservation\ReservationApiController;
use App\Http\Controllers\Order\OrderController;
use Illuminate\Support\Facades\Route;

Route::controller(ExpenseCategoryApiController::class)
    ->group(function () {
        Route::get('/expense-categories', 'index');
        Route::post('/expense-categories', 'store');
    });

Route::post('/product-categories', [ProductCategoryApiController::class, 'store']);

Route::get('/booking-data', [ReservationApiController::class, 'bookingData']);
Route::get('/reservations/{reservation}', [ReservationApiController::class, 'show']);

Route::get('/orders', [OrderApiController::class, 'index']);
Route::patch('/order-items/{orderItem}', [OrderController::class, 'updateItem']);
Route::delete('/order-items/{orderItem}', [OrderController::class, 'destroyItem']);
