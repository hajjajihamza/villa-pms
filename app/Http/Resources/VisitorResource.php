<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Visitor
 */
class VisitorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'country' => $this->country,
            'is_main' => (bool) $this->is_main,
            'reservation_id' => $this->reservation_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'documents' => DocumentResource::collection($this->whenLoaded('documents')),
        ];
    }
}
