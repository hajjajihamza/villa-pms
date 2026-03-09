<?php

namespace App\Http\Controllers\Settings\Channel;

use App\Http\Controllers\Controller;
use App\Http\Requests\Channel\StoreChannelRequest;
use App\Http\Requests\Channel\UpdateChannelRequest;
use App\Models\Channel;
use Illuminate\Http\RedirectResponse;

class ChannelController extends Controller
{
    public function index(): RedirectResponse
    {
        return to_route('settings.index');
    }

    public function store(StoreChannelRequest $request): RedirectResponse
    {
        Channel::create($request->validated());

        return to_route('settings.index');
    }

    public function update(UpdateChannelRequest $request, Channel $channel): RedirectResponse
    {
        $channel->update($request->validated());

        return to_route('settings.index');
    }

    public function destroy(Channel $channel): RedirectResponse
    {
        $channel->delete();

        return to_route('settings.index');
    }
}
