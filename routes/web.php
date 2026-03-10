<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Expense\ExpenseController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])
    ->middleware('auth')
    ->name('dashboard');

Route::middleware('auth')->group(function (): void {
    Route::resource('expenses', ExpenseController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
