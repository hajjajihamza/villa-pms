<?php

namespace App\Http\Requests\Accommodation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAccommodationRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:accommodations,name'],
            'daily_price' => ['required', 'numeric', 'min:0'],
            'max_adults' => ['required', 'integer', 'min:0'],
            'max_children' => ['required', 'integer', 'min:0'],
            'service_price' => ['required', 'numeric', 'min:0'],
            'color' => ['nullable', 'string', 'max:20'],
        ];
    }
}
