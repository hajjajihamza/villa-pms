<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api\Expense;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseCategoryRequest;
use App\Models\ExpenseCategory;
use App\Http\Resources\ExpenseCategoryResource;
use Illuminate\Http\JsonResponse;

class ExpenseCategoryApiController extends Controller
{
    public function store(StoreExpenseCategoryRequest $request): JsonResponse
    {
        $category = ExpenseCategory::create($request->validated());

        return response()->json(new ExpenseCategoryResource($category), 201);
    }
}
