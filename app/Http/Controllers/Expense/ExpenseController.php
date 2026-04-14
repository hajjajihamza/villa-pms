<?php
declare(strict_types=1);

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Models\Accommodation;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Expense::query()
            ->with(['category', 'accommodation', 'creator'])
            ->latest('date');

        if ($request->filled('name')) {
            $query->whereLike('name', '%'.$request->string('name')->toString().'%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('accommodation_id')) {
            $query->where('accommodation_id', $request->integer('accommodation_id'));
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->string('date')->toString());
        }

        return Inertia::render('expenses/index', [
            'expenses' => $query
                ->paginate(30)
                ->withQueryString(),
            'categories' => ExpenseCategory::query()->orderBy('name')->get(['id', 'name']),
            'accommodations' => Accommodation::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'name' => $request->string('name')->toString(),
                'category_id' => $request->string('category_id')->toString(),
                'accommodation_id' => $request->string('accommodation_id')->toString(),
                'date' => $request->string('date')->toString(),
            ],
        ]);
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        Expense::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return to_route('expenses.index');
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $expense->update($request->validated());

        return to_route('expenses.index');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return to_route('expenses.index');
    }
}
