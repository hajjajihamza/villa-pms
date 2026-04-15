<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\IcalSource\StoreIcalSourceRequest;
use App\Models\Accommodation;
use App\Models\IcalSource;
use Illuminate\Http\RedirectResponse;

class IcalSourceController extends Controller
{
    /**
     * Store a newly created iCal source in storage.
     */
    public function store(StoreIcalSourceRequest $request, Accommodation $accommodation): RedirectResponse
    {
        $data = $request->validated();
        $accommodation->channels()->syncWithoutDetaching([
            $data['channel_id'] => [
                'url' => $data['url']
            ]
        ]);

        return back()->with('success', 'Source iCal ajoutée avec succès.');
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
