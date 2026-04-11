<?php

namespace App\Http\Requests\Settings\Channel;

use App\Models\Channel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rule\ValidationRule;

class UpdateChannelRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Channel $channel */
        $channel = $this->route('channel');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('channels', 'name')->ignore($channel->id)],
            'commission' => ['required', 'numeric', 'min:0', 'max:100'],
            'color' => ['nullable', 'string', 'max:20'],
            'ical_url' => ['nullable', 'url'],
        ];
    }
}
