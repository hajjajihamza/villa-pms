<?php

use App\Enums\FrequencyEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recurring_expenses', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->decimal('amount', 12, 2);
            $table->enum('frequency', [
                FrequencyEnum::DAILY,
                FrequencyEnum::WEEKLY,
                FrequencyEnum::MONTHLY,
                FrequencyEnum::YEARLY,
            ])->default(FrequencyEnum::MONTHLY);
            $table->unsignedInteger('interval')->default(1);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->date('next_run_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_expenses');
    }
};

