<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Expense\ExpenseCategoryApiController;
use Illuminate\Support\Facades\Route;

Route::controller(ExpenseCategoryApiController::class)
    ->group(function () {
        Route::get('/expense-categories', 'index');
        Route::post('/expense-categories', 'store');
    });
