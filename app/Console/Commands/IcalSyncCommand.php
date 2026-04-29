<?php

namespace App\Console\Commands;

use App\Services\Ical\IcalService;
use Illuminate\Console\Command;

class IcalSyncCommand extends Command
{
    protected $signature = 'app:ical-sync';
    protected $description = 'Sync reservations from iCal sources with statistics and error reporting';

    public function handle(): int
    {
        $this->line('');
        $this->info('🚀 Starting iCal synchronization...');
        $this->line('');

        try {
            /** @var IcalService $service */
            $service = app(IcalService::class);

            $result = $service->syncAll();

            $this->displayStats($result);

            if (!$result['success']) {
                $this->warn('⚠ Sync completed with errors.');
                return self::FAILURE;
            }

            $this->info('✅ Sync completed successfully.');
            return self::SUCCESS;

        } catch (\Throwable $e) {
            $this->error('❌ Fatal error: ' . $e->getMessage());
            return self::FAILURE;
        }
    }

    private function displayStats(array $result): void
    {
        $stats = $result['stats'];

        $this->line('================= ICAL SYNC REPORT =================');

        $this->line("Sources   : {$stats['total_sources']}");
        $this->line("Events    : {$stats['total_events']}");
        $this->line("Processed : {$stats['processed']}");
        $this->info("Created   : {$stats['created']}");
        $this->warn("Skipped   : {$stats['skipped']}");
        $this->error("Errors    : {$stats['errors']}");

        if (!empty($result['created_info'])) {
            $this->line('===================================================');
            $this->line('');
            $this->info('CREATED INFO PER SOURCE:');

            $this->table(
                ['UID', 'Channel', 'Check in', 'Check out', 'Daily price', 'Service price', 'Created by', 'URL'],
                $stats['created_info']
            );
        }

        if (!empty($result['errors'])) {
            $this->line('===================================================');
            $this->line('');
            $this->error('ERROR DETAILS:');

            foreach ($result['errors'] as $index => $error) {
                $this->line('----------------------------------------');
                $this->line("Error #" . ($index + 1));

                $this->line("Source ID : {$error['source_id']}");
                $this->line("Channel   : {$error['channel']}");
                $this->line("URL       : {$error['url']}");
                $this->error("Message   : {$error['message']}");

                if (!empty($error['context'])) {
                    $this->line("Context   : " . json_encode($error['context']));
                }
            }
        }

        $this->line('');
    }
}
