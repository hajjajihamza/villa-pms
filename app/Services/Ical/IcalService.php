<?php
declare(strict_types=1);

namespace App\Services\Ical;

use App\Models\IcalReservation;
use App\Models\IcalSource;
use Sabre\VObject\Reader;

class IcalService
{
    /**
     * Parse iCal content and store reservations for a given channel.
     *
     * @param string $content
     * @param IcalSource $source
     * @return void
     */
    public function syncFromContent(string $content, IcalSource $source): void
    {
        $vcalendar = Reader::read($content);

        foreach ($vcalendar->VEVENT as $event) {
            $uid = (string) $event->UID;
            $dtstart = $event->DTSTART->getDateTime();
            $dtend = $event->DTEND->getDateTime();

            IcalReservation::updateOrCreate(
                ['uid' => $uid],
                [
                    'dtstart' => $dtstart->format('Y-m-d H:i:s'),
                    'dtend' => $dtend->format('Y-m-d H:i:s'),
                    'ical_source_id' => $source->id,
                ]
            );

            $source->update(['last_sync_at' => now()]);
        }
    }
}
