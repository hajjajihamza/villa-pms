<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IcalSourceResource extends JsonResource
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
            'channel_id' => $this->channel_id,
            'unit_id' => $this->unit_id,
            'unit' => $this->whenLoaded('unit'),
            'url' => $this->url,
            'last_sync_at' => $this->last_sync_at,
        ];
    }
}
