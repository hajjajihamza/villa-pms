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
                'main_visitor' => [
                    'full_name' => $this->reservation?->mainVisitor?->full_name
                ],
                'accommodation' => [
                    'name' => $this->reservation?->accommodation?->name
                ],
            ],
            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
        ];
    }
}
