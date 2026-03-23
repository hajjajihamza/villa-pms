<?php

declare(strict_types=1);

namespace App\Http\Requests\Reservation;

use App\Enums\DocTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class DocumentRequest extends FormRequest
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
            'type' => ['required', new Enum(DocTypeEnum::class)],
            'file' => [$this->isMethod('POST') ? 'required' : 'nullable', 'file', 'max:5120', 'mimes:jpg,jpeg,png,pdf'],
        ];
    }
}
