<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api\Expense;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseCategoryRequest;
use App\Models\Accommodation;
use App\Models\ExpenseCategory;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;

class ExpenseCategoryApiController extends Controller
{
    public function index(): JsonResponse
    {
        $request = [
            "check_in" => "2026-03-12T00:00:00.000000Z",
            "check_out" => "2026-03-12T00:00:00.000000Z"
        ];
        $query = Unit::query()->with('accommodations', 'accommodations.reservations')->get();

        $unites = $query->map(function ($unit){
            $res = $unit->accommodations->map(function (Accommodation $accommodation) {
                return $accommodation->reservations;
            })->toArray();

            $reservations = array_map(function ($item){
                return [
                    'check_in'=>$item[0]['check_in'],
                    'check_out'=>$item[0]['check_out']
                ];
            }, $res);

            $reservationsCheckIn = array_map(function ($item){
                return $item["check_in"];
            }, array_values($reservations));
            sort($reservationsCheckIn);
            $min_check_in = $reservationsCheckIn[0];

            $reservationsCheckOut = array_map(function ($item){
                return $item["check_out"];
            }, array_values($reservations));
            sort($reservationsCheckOut);
            $max_check_out = $reservationsCheckOut[0];

            return [
                'name' => $unit->name,
                'min_check_in' => $min_check_in,
                'max_check_out' => $max_check_out
            ];
        })->toArray();

        foreach ($unites as &$unite){
            $unite["isDispo"] = $this->isDisponible($unite, $request);
        }
        dd($unites);


        $categories = ExpenseCategory::query()
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function isDisponible($unit, $request)
    {
        if($request["check_out"] < $unit["min_check_in"] || $request["check_in"] > $unit["max_check_out"]){
            return true;
        }
        return false;
    }

    public function store(StoreExpenseCategoryRequest $request): JsonResponse
    {
        $category = ExpenseCategory::create($request->validated());

        return response()->json($category, 201);
    }
}
