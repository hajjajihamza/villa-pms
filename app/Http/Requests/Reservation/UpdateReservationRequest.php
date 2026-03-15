<?php
declare(strict_types=1);

namespace App\Http\Requests\Reservation;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReservationRequest extends FormRequest
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
            'advance_amount' => ['nullable', 'numeric', 'min:0'],
            'daily_price' => ['nullable', 'numeric', 'min:0'],
            'service_price' => ['nullable', 'numeric', 'min:0'],
            'channel_id' => ['required', 'exists:channels,id'],
            'accommodation_id' => ['required', 'exists:accommodations,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'children' => $this->input('children') === '' ? 0 : $this->input('children'),
            'advance_amount' => $this->input('advance_amount') === '' ? 0 : $this->input('advance_amount'),
            'daily_price' => $this->input('daily_price') === '' ? 0 : $this->input('daily_price'),
            'service_price' => $this->input('service_price') === '' ? 0 : $this->input('service_price'),
        ]);
    }
}
