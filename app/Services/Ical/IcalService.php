<?php

declare(strict_types=1);

namespace App\Services\Ical;

use App\Enums\RoleEnum;
use App\Models\IcalSource;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Sabre\VObject\Reader;

class IcalService
{
    private array $stats = [];
    private array $errors = [];

    public function __construct()
    {
        $this->resetStats();
    }

    private function resetStats(): void
    {
        $this->stats = [
            'total_sources' => 0,
            'total_events' => 0,
            'processed' => 0,
            'created' => 0,
            'skipped' => 0,
            'errors' => 0,
            'created_info' => []
        ];
    }

    public function syncAll(): array
    {
        $sources = IcalSource::query()
            ->with(['accommodation', 'channel'])
            ->get();

        $this->stats['total_sources'] = $sources->count();

        foreach ($sources as $source) {
            $this->syncSource($source);
        }

        return [
            'success' => $this->stats['errors'] === 0,
            'stats' => $this->stats,
            'errors' => $this->errors,
        ];
    }

    private function syncSource(IcalSource $source): void
    {
        try {
            $response = Http::retry(3, 2000)
                ->timeout(10)
                ->withHeaders([
                    'User-Agent' => 'Laravel iCal Client', // Send a user agent for the server because some providers block requests without it
                ])
                ->get((string) $source->url);

            if (!$response->successful()) {
                $this->addError($source, "HTTP error {$response->status()}");
                return;
            }

            $this->syncFromContent($response->body(), $source);
        } catch (\Throwable $e) {
            $this->addError($source, $e->getMessage());
        }
    }

    private function syncFromContent(string $content, IcalSource $source): void
    {
        try {
            $vcalendar = Reader::read($content);

            if (!$vcalendar->VEVENT) {
                return;
            }

            foreach ($vcalendar->VEVENT as $event) {
                $this->stats['total_events']++;

                try {
                    $this->processEvent($event, $source);
                } catch (\Throwable $e) {
                    $this->addError($source, $e->getMessage(), [
                        'event_uid' => (string) $event->UID
                    ]);
                }
            }

            $source->update(['last_sync_at' => now()]);

        } catch (\Throwable $e) {
            $this->addError($source, "Invalid iCal format: " . $e->getMessage());
        }
    }

    private function processEvent($event, IcalSource $source): void
    {
        $this->stats['processed']++;

        $uid = (string) $event->UID;
        $dtstart = Carbon::parse($event->DTSTART->getDateTime());
        $dtend = Carbon::parse($event->DTEND->getDateTime());

        $accommodation = $source->accommodation;

        $exists = Reservation::query()
            ->where(function ($q) use ($uid, $dtstart, $dtend, $accommodation) {
                $q->where('uid', $uid)
                    ->orWhere(function ($q2) use ($dtstart, $dtend, $accommodation) {
                        $q2->whereHas('accommodations', function (Builder $q3) use ($accommodation) {
                            $q3->where('accommodation_reservation.accommodation_id', $accommodation->id);
                        })
                            ->whereNull('deleted_at')
                            ->where('check_in', '<', $dtend->format('Y-m-d'))
                            ->where('check_out', '>', $dtstart->format('Y-m-d'));
                    });
            })
            ->exists();

        if ($exists) {
            $this->stats['skipped']++;
            return;
        }

        $admin = User::where('role', RoleEnum::ADMIN->value)->first();

        if (!$admin) {
            throw new \Exception('Admin user not found');
        }

        $data = [
            'uid' => $uid,
            'channel_id' => $source->channel_id,
            'check_in' => $dtstart->format('Y-m-d'),
            'check_out' => $dtend->format('Y-m-d'),
            'daily_price' => $accommodation->daily_price,
            'service_price' => $accommodation->service_price,
            'created_by' => $admin->id,
        ];

        if ($dtstart->lt(now())) {
            $data['real_check_in'] = $data['check_in'];
            $data['real_check_out'] = $data['check_out'];
        }

        $reservation = Reservation::create($data);

        $accommodation->reservations()->attach($reservation->id);

        $this->stats['created_info'][] = array_values(array_merge($data, ['url_source' => $source->url]));

        $this->stats['created']++;
    }

    private function addError(IcalSource $source, string $message, array $context = []): void
    {
        $this->stats['errors']++;

        $error = [
            'source_id' => $source->id,
            'channel' => $source->channel->name ?? null,
            'url' => $source->url,
            'message' => $message,
            'context' => $context,
        ];

        $this->errors[] = $error;

        Log::error('iCal Sync Error', $error);
    }
}
