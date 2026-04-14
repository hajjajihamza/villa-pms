<?php
declare(strict_types=1);

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
            'category_id' => ['nullable', 'exists:expense_categories,id'],
            'accommodation_id' => ['nullable', 'exists:accommodations,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('accommodation_id') === '') {
            $this->merge(['accommodation_id' => null]);
        }
    }
}
