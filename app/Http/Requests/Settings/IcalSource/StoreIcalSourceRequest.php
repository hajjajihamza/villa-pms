<?php

namespace App\Http\Requests\Settings\IcalSource;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreIcalSourceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'unit_id' => [
                'required',
                'exists:units,id',
                \Illuminate\Validation\Rule::unique('ical_sources')
                    ->where('channel_id', $this->channel_id)
            ],
            'channel_id' => ['required', 'exists:channels,id'],
            'url' => ['required', 'url'],
        ];
    }
}
