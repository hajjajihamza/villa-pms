<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\Accommodation\StoreAccommodationRequest;
use App\Http\Requests\Settings\Accommodation\UpdateAccommodationRequest;
use App\Models\Accommodation;
use App\Services\Settings\AccommodationService;
use Illuminate\Http\RedirectResponse;

class AccommodationController extends Controller
{
    public function __construct(
        protected AccommodationService $accommodationService
    ) {}

    public function store(StoreAccommodationRequest $request): RedirectResponse
    {
        $this->accommodationService->create($request->validated());

        return to_route('settings.index');
    }

    public function update(UpdateAccommodationRequest $request, Accommodation $accommodation): RedirectResponse
    {
        $this->accommodationService->update($accommodation, $request->validated());

        return to_route('settings.index');
    }

    public function destroy(Accommodation $accommodation): RedirectResponse
    {
        $this->accommodationService->delete($accommodation);

        return to_route('settings.index');
    }
}
