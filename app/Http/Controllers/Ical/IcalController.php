<?php

declare(strict_types=1);

namespace App\Http\Controllers\Ical;

use App\Http\Controllers\Controller;
use App\Services\Ical\IcalService;
use Illuminate\Http\RedirectResponse;

class IcalController extends Controller
{
    public function __construct(
        protected IcalService $icalService
    ) {}

    /**
     * Synchronize iCal reservations from all channels.
     */
    public function sync(): RedirectResponse
    {
        $this->icalService->syncAll();

        return redirect()->route('dashboard')->with('success', 'Synchronisation iCal terminée.');
    }
}
