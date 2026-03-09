<?php

namespace App\Http\Controllers\Settings\Accommodation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Accommodation\StoreAccommodationRequest;
use App\Http\Requests\Accommodation\UpdateAccommodationRequest;
use App\Models\Accommodation;
use Illuminate\Http\RedirectResponse;

class AccommodationController extends Controller
{
    public function index(): RedirectResponse
    {
        return to_route('settings.index');
    }

    public function store(StoreAccommodationRequest $request): RedirectResponse
    {
        Accommodation::create($request->validated());

        return to_route('settings.index');
    }

    public function create(): RedirectResponse
    {
        return to_route('settings.index');
    }

    public function show(Accommodation $accommodation): RedirectResponse
    {
        return to_route('settings.index');
    }

    public function edit(Accommodation $accommodation): RedirectResponse
    {
        return to_route('settings.index');
    }

    public function update(UpdateAccommodationRequest $request, Accommodation $accommodation): RedirectResponse
    {
        $accommodation->update($request->validated());

        return to_route('settings.index');
    }

    public function destroy(Accommodation $accommodation): RedirectResponse
    {
        $accommodation->delete();

        return to_route('settings.index');
    }
}
