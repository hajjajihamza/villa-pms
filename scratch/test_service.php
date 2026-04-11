<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

try {
    $service = new \App\Services\IcalService();
    echo "IcalService successfully instantiated.\n";
} catch (\Throwable $e) {
    echo "Error instantiating IcalService: " . $e->getMessage() . "\n";
}
