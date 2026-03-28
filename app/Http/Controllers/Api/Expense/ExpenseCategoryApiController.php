<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api\Expense;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseCategoryRequest;
use App\Models\ExpenseCategory;
use Illuminate\Http\JsonResponse;

class ExpenseCategoryApiController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = ExpenseCategory::query()
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function store(StoreExpenseCategoryRequest $request): JsonResponse
    {
        $category = ExpenseCategory::create($request->validated());

        return response()->json($category, 201);
    }
}
