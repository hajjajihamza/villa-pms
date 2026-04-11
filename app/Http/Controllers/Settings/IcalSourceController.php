<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\IcalSource\StoreIcalSourceRequest;
use App\Http\Requests\Settings\IcalSource\UpdateIcalSourceRequest;
use App\Models\IcalSource;
use Illuminate\Http\RedirectResponse;

class IcalSourceController extends Controller
{
    /**
     * Store a newly created iCal source in storage.
     */
    public function store(StoreIcalSourceRequest $request): RedirectResponse
    {
        IcalSource::create($request->validated());

        return back()->with('success', 'Source iCal ajoutée avec succès.');
    }

    /**
     * Update the specified iCal source in storage.
     */
    public function update(UpdateIcalSourceRequest $request, IcalSource $icalSource): RedirectResponse
    {
        $icalSource->update($request->validated());

        return back()->with('success', 'Source iCal mise à jour avec succès.');
    }

    /**
     * Remove the specified iCal source from storage.
     */
    public function destroy(IcalSource $icalSource): RedirectResponse
    {
        $icalSource->delete();

        return back()->with('success', 'Source iCal supprimée avec succès.');
    }
}
