<?php

declare(strict_types=1);

namespace App\Services\Ical;

use App\Models\IcalReservation;
use App\Models\IcalSource;
use Illuminate\Support\Facades\DB;
use Sabre\VObject\Reader;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IcalService
{
    public function syncAll(): void
    {
        $sources = IcalSource::query()
            ->with(['unit', 'channel', 'icalReservations'])
            ->get();

        foreach ($sources as $source) {
            try {
                // pour éviter le proplem de 429 too many requests
                $response = Http::retry(3, 2000)
                    ->timeout(10)
                    ->withHeaders([
                        'User-Agent' => 'Laravel iCal Client',
                    ])
                    ->get((string) $source->url);

                if ($response->successful()) {
                    $this->syncFromContent($response->body(), $source);
                } else {
                    Log::error("Failed to fetch iCal for iCal source : channel:{$source->channel->name}: | unit:{$sources->unit->name} | url:{$sources->url}: HTTP {$response->status()}");
                }
            } catch (\Exception $e) {
                Log::error("Error syncing iCal for source : {$source->id}: {$e->getMessage()}");
            }
        }
    }

    /**
     * Parse iCal content and store reservations for a given channel.
     */
    private function syncFromContent(string $content, IcalSource $source): void
    {
        $vcalendar = Reader::read($content);

        foreach ($vcalendar->VEVENT as $event) {
            $uid = (string) $event->UID;
            $dtstart = $event->DTSTART->getDateTime();
            $dtend = $event->DTEND->getDateTime();

            $existingReservation = IcalReservation::query()
                ->where('uid', $uid)
                ->orWhere(DB::raw('DATE_FORMAT(dtstart, "%Y-%m-%d")'), $dtstart->format('Y-m-d'))
                ->orWhere(DB::raw('DATE_FORMAT(dtend, "%Y-%m-%d")'), $dtend->format('Y-m-d'))
                ->first();

            if ($existingReservation) {
                $existingReservation->update([
                    'dtstart' => $dtstart->format('Y-m-d H:i:s'),
                    'dtend' => $dtend->format('Y-m-d H:i:s'),
                    'ical_source_id' => $source->id,
                ]);
            } else {
                IcalReservation::create([
                    'uid' => $uid,
                    'dtstart' => $dtstart->format('Y-m-d H:i:s'),
                    'dtend' => $dtend->format('Y-m-d H:i:s'),
                    'ical_source_id' => $source->id,
                ]);
            }

            $source->update(['last_sync_at' => now()]);
        }
    }
}
