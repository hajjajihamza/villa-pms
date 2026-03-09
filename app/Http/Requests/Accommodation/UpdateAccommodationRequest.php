<?php

namespace App\Http\Requests\Accommodation;

use App\Models\Accommodation;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAccommodationRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Accommodation $accommodation */
        $accommodation = $this->route('accommodation');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('accommodations', 'name')->ignore($accommodation->id)],
            'daily_price' => ['required', 'numeric', 'min:0'],
            'max_adults' => ['required', 'integer', 'min:0'],
            'max_children' => ['required', 'integer', 'min:0'],
            'service_price' => ['required', 'numeric', 'min:0'],
            'color' => ['nullable', 'string', 'max:20'],
        ];
    }
}
