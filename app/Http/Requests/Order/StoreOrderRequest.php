<?php
declare(strict_types=1);

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
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
            'reservation_id' => ['nullable', 'exists:reservations,id'],
            'order_items' => ['required', 'array', 'min:1'],
            'order_items.*.product_id' => ['nullable', 'exists:products,id'],
            'order_items.*.product_name' => ['required', 'string', 'max:255'],
            'order_items.*.quantity' => ['required', 'integer', 'min:1'],
            'order_items.*.price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
