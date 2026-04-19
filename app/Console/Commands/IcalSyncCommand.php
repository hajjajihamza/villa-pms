<?php

namespace App\Console\Commands;

use App\Services\Ical\IcalService;
use Illuminate\Console\Command;

class IcalSyncCommand extends Command
{
    public function __construct(
        protected IcalService $icalService
    ) {}

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:ical-sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Commande de synchronisation des calendriers des canaux de réservation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->icalService->syncAll();
    }
}
