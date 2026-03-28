<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductCategoryRequest;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;

class ProductCategoryApiController extends Controller
{
    public function store(StoreProductCategoryRequest $request): JsonResponse
    {
        $category = ProductCategory::create($request->validated());

        return response()->json($category, 201);
    }
}
