<?php

declare(strict_types=1);

namespace App\Services\Settings;

use App\Models\Accommodation;

class AccommodationService
{
    /**
     * Create a new accommodation.
     */
    public function create(array $data): Accommodation
    {
        return Accommodation::create($data);
    }

    /**
     * Update an existing accommodation.
     */
    public function update(Accommodation $accommodation, array $data): bool
    {
        return $accommodation->update($data);
    }

    /**
     * Delete an accommodation.
     */
    public function delete(Accommodation $accommodation): bool
    {
        return $accommodation->delete();
    }
}
