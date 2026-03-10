<?php
declare(strict_types=1);

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
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
            'unit_id' => ['nullable', 'exists:units,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('unit_id') === '') {
            $this->merge(['unit_id' => null]);
        }
    }
}
