<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\Channel\StoreChannelRequest;
use App\Http\Requests\Settings\Channel\UpdateChannelRequest;
use App\Models\Channel;
use App\Services\Settings\ChannelService;
use Illuminate\Http\RedirectResponse;

class ChannelController extends Controller
{
    public function __construct(
        protected ChannelService $channelService
    ) {}
    
    public function store(StoreChannelRequest $request): RedirectResponse
    {
        $this->channelService->create($request->validated());

        return to_route('settings.index');
    }

    public function update(UpdateChannelRequest $request, Channel $channel): RedirectResponse
    {
        $this->channelService->update($channel, $request->validated());

        return to_route('settings.index');
    }

    public function destroy(Channel $channel): RedirectResponse
    {
        $this->channelService->delete($channel);

        return to_route('settings.index');
    }
}
