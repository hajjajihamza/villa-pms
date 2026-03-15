<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVisitorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:2'],
            'document_number' => ['nullable', 'string', 'max:255'],
            'documents' => ['nullable', 'array'],
            'documents.*.file' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'], // 5MB max
            'documents.*.type' => ['required_with:documents', 'string', 'in:ID_CARD,PASSPORT,DRIVERS_LICENSE,RESIDENCE_CARD'],
            'documents.*.id' => ['nullable', 'integer', 'exists:documents,id'],
        ];
    }
}
