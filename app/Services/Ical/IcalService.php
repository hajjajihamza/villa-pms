<?php
declare(strict_types=1);

namespace App\Services\Ical;

use App\Models\Channel;
use App\Models\IcalReservation;
use Sabre\VObject\Reader;

class IcalService
{
    /**
     * Parse iCal content and store reservations for a given channel.
     *
     * @param string $content
     * @param Channel $channel
     * @return void
     */
    public function syncFromContent(string $content, Channel $channel): void
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
                    'channel_id' => $channel->id,
                ]
            );
        }
    }
}
