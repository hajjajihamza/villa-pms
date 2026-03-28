<?php

namespace App\Http\Controllers\Sale;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Reservation;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class SaleController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today()->toDateTimeString();
        $products = Product::all();
        $categories = ProductCategory::all();
        $reservations = Reservation::where('real_check_in', '<=', $today)
                    ->orWhere('real_check_out', '>', $today)
                    ->orWhere('check_in', '>=', $today)
                    ->with('mainVisitor')
                    ->orderBy('check_in')
                    ->get(['id', 'check_in', 'check_out', 'real_check_in', 'real_check_out'])
                    ->append(['status']);

        return Inertia::render('sale/index', [
            'products' => $products,
            'categories' => $categories,
            'reservations' => $reservations,
        ]);
    }
}
