<?php

declare(strict_types=1);

namespace App\Http\Controllers\Ical;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Services\Ical\IcalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        $channels = Channel::whereNotNull('ical_url')->get();

        foreach ($channels as $channel) {
            try {
                // pour éviter le proplem de 429 too many requests
                $response = Http::retry(3, 2000)
                    ->timeout(10)
                    ->withHeaders([
                        'User-Agent' => 'Laravel iCal Client',
                    ])
                    ->get((string) $channel->ical_url);

                if ($response->successful()) {
                    $this->icalService->syncFromContent($response->body(), $channel);
                } else {
                    Log::error("Failed to fetch iCal for channel {$channel->name}: HTTP {$response->status()}");
                }
            } catch (\Exception $e) {
                Log::error("Error syncing iCal for channel {$channel->name}: {$e->getMessage()}");
            }
        }

        return redirect()->route('dashboard')->with('success', 'Synchronisation iCal terminée.');
    }
}
