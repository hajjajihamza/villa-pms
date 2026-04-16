<?php

declare(strict_types=1);

namespace App\Services\Ical;

use App\Enums\RoleEnum;
use App\Models\IcalSource;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Sabre\VObject\Reader;

class IcalService
{
    public function syncAll(): void
    {
        $sources = IcalSource::query()
            ->with(['accommodation', 'channel'])
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
                    Log::error("Failed to fetch iCal for iCal source : channel:{$source->channel->name}: | accommodation:{$source->accommodation->name} | url:{$source->url}: HTTP {$response->status()}");
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
            $dtstart = Carbon::parse($event->DTSTART->getDateTime());
            $dtend = Carbon::parse($event->DTEND->getDateTime());

            $accommodation = $source->accommodation;

            // existing reservation by date interval overlap or uid
            $existingReservation = Reservation::query()
                ->where('check_in', '<', $dtend->format('Y-m-d'))
                ->where('check_out', '>', $dtstart->format('Y-m-d'))
                ->orWhere('uid', $uid)
                ->first();

            if ($existingReservation) {
                continue;
            }

            $data = [
                'uid' => $uid,
                'channel_id' => $source->channel_id,
                'check_in' => $dtstart->format('Y-m-d'),
                'check_out' => $dtend->format('Y-m-d'),
                'daily_price' => $accommodation->daily_price,
                'service_price' => $accommodation->service_price,
                'created_by' => User::where('role', RoleEnum::ADMIN->value)->first()->id,
            ];

            if ($dtstart->lt(now())) {
                $data['real_check_in'] = $dtstart->format('Y-m-d');
                $data['real_check_out'] = $dtend->format('Y-m-d');
            }

            $reservation = Reservation::create($data);

            $accommodation->reservations()->attach($reservation->id);

            $source->update(['last_sync_at' => now()]);
        }
    }
}
