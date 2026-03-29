<?php

declare(strict_types=1);

namespace App\Services\Settings;

use App\Models\Channel;

class ChannelService
{
    /**
     * Create a new channel.
     */
    public function create(array $data): Channel
    {
        return Channel::create($data);
    }

    /**
     * Update an existing channel.
     */
    public function update(Channel $channel, array $data): bool
    {
        return $channel->update($data);
    }

    /**
     * Delete a channel.
     */
    public function delete(Channel $channel): bool
    {
        return $channel->delete();
    }
}
