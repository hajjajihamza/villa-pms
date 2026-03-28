<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Expense\ExpenseCategoryApiController;
use App\Http\Controllers\Api\ProductCategoryApiController;
use App\Http\Controllers\Api\Reservation\ReservationApiController;
use Illuminate\Support\Facades\Route;

Route::controller(ExpenseCategoryApiController::class)
    ->group(function () {
        Route::get('/expense-categories', 'index');
        Route::post('/expense-categories', 'store');
    });

Route::post('/product-categories', [ProductCategoryApiController::class, 'store']);

Route::get('/booking-data', [ReservationApiController::class, 'bookingData']);
Route::get('/reservations/{reservation}', [ReservationApiController::class, 'show']);

Route::get('/orders', [\App\Http\Controllers\Order\OrderController::class, 'index']);
Route::patch('/order-items/{orderItem}', [\App\Http\Controllers\Order\OrderController::class, 'updateItem']);
Route::delete('/order-items/{orderItem}', [\App\Http\Controllers\Order\OrderController::class, 'destroyItem']);
