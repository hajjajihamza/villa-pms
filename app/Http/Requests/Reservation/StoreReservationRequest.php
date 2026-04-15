<?php
declare(strict_types=1);

namespace App\Http\Requests\Reservation;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
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
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'adults' => ['required', 'integer', 'min:1'],
            'children' => ['nullable', 'integer', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'channel_id' => ['required', 'exists:channels,id'],
            'accommodation_ids' => ['required', 'array', 'min:1'],
            'accommodation_ids.*' => ['exists:accommodations,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:2'],
        ];
    }
}
