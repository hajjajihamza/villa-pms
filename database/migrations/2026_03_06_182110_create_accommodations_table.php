<?php

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
        Schema::create('accommodations', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->decimal('daily_price', 12, 2);
            $table->unsignedInteger('max_adults');
            $table->unsignedInteger('max_children');
            $table->decimal('service_price', 12, 2)->default(0);
            $table->string('color')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accommodations');
    }
};
