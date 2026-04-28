<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Reservation;
use App\Models\Accommodation;

class PosController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today()->toDateTimeString();
        $products = Product::all();
        $categories = ProductCategory::query()->orderBy('name')->get();
        $accommodations = Accommodation::all();
        $reservations = Reservation::where('check_out', '>', $today)
                    ->where('check_in', '>=', $today)
                    ->orWhere('real_check_out', '>=', $today)
                    ->with('mainVisitor')
                    ->orderBy('check_in')
                    ->get(['id', 'check_in', 'check_out', 'real_check_in', 'real_check_out'])
                    ->append(['status']);

        return Inertia::render('pos/index', [
            'products' => $products,
            'categories' => $categories,
            'reservations' => $reservations,
            'accommodations' => $accommodations,
        ]);
    }

    public function indexV2(): Response
    {
        $products = Product::all();
        $categories = ProductCategory::query()->orderBy('name')->get();

        return Inertia::render('pos/index-v2', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

}
