<?php
declare(strict_types=1);

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', 'unique:products,name,' . $this->route('product')->id],
            'price' => ['required', 'numeric', 'min:0'],
            'category_id' => ['required', 'exists:product_categories,id'],
            'icon' => ['nullable', 'string', 'max:255'],
        ];
    }
}
