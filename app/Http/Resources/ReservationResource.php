<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Reservation
 */
class ReservationResource extends JsonResource
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
            'check_in' => $this->check_in?->toDateString(),
            'check_out' => $this->check_out?->toDateString(),
            'real_check_in' => $this->real_check_in,
            'real_check_out' => $this->real_check_out,
            'adults' => $this->adults,
            'children' => $this->children,
            'reported' => $this->reported,
            'advance_amount' => (float) $this->advance_amount,
            'daily_price' => (float) $this->daily_price,
            'service_price' => (float) $this->service_price,
            'deleted_note' => $this->deleted_note,
            'created_by' => $this->created_by,
            'channel_id' => $this->channel_id,
            'accommodation_id' => $this->accommodation_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Appends / Accessors
            'amount_to_pay' => $this->amount_to_pay,
            'total_price' => $this->total_price,
            'total_orders_amount' => $this->total_orders_amount,
            'guests_count' => $this->guests_count,
            'duration' => $this->duration,
            'status' => $this->status,
            'can_validate' => $this->can_validate,

            // Relationships
            'accommodation' => $this->whenLoaded('accommodation'),
            'channel' => $this->whenLoaded('channel'),
            'main_visitor' => $this->whenLoaded('mainVisitor'),
            'visitors' => $this->whenLoaded('visitors'),
            'orders' => $this->whenLoaded('orders'),
            'creator' => $this->whenLoaded('creator'),
        ];
    }
}
