<?php

declare(strict_types=1);

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Advance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdvanceController extends Controller
{
    /**
     * Store a newly created advance in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reservation_id' => ['required', 'exists:reservations,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'date' => ['required', 'date'],
        ]);

        Advance::create($validated);

        return redirect()->back()->with('success', 'Avance ajoutée avec succès.');
    }

    /**
     * Update the specified advance in storage.
     */
    public function update(Request $request, Advance $advance): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'gt:0'],
            'date' => ['required', 'date'],
        ]);

        $advance->update($validated);

        return redirect()->back()->with('success', 'Avance mise à jour avec succès.');
    }

    /**
     * Remove the specified advance from storage.
     */
    public function destroy(Advance $advance): RedirectResponse
    {
        $advance->delete();

        return redirect()->back()->with('success', 'Avance supprimée avec succès.');
    }
}
