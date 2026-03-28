<?php
declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'date' => $this->date?->format('Y-m-d H:i:s'),
            'total_amount' => $this->total_amount,
            'reservation' => [
                'id' => $this->reservation_id,
                'customer_name' => $this->reservation?->main_visitor?->full_name,
                'accommodation_name' => $this->reservation?->accommodation?->name,
            ],
            'items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
        ];
    }
}
