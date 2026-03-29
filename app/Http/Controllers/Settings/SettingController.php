<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Accommodation;
use App\Models\Channel;
use App\Services\Settings\SettingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected SettingService $service
    ) {}

    /**
     * Display the settings index page.
     */
    public function index(): Response
    {
        return Inertia::render('settings/index', [
            'accommodations' => Accommodation::all(),
            'channels' => Channel::orderBy('name')->get(),
            'user' => auth()->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function updateProfile(ProfileUpdateRequest $request): RedirectResponse
    {
        $this->service->updateProfile($request->user(), $request->validated());

        return back()->with('success', 'Profile mis à jour avec succès.');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(PasswordUpdateRequest $request): RedirectResponse
    {
        $this->service->updatePassword($request->user(), $request->password);

        return back()->with('success', 'Mot de passe mis à jour avec succès.');
    }
}
