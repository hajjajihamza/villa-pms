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

    public function sync(): RedirectResponse
    {
        $this->icalService->syncAll();

        return redirect()->route('planning.index')->with('success', 'Synchronisation iCal terminée.');
    }
}
