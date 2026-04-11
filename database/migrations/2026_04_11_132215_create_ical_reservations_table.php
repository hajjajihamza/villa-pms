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
        Schema::create('ical_reservations', function (Blueprint $table) {
            $table->id();
            $table->string('uid')->unique();
            $table->dateTime('dtstart');
            $table->dateTime('dtend');
            $table->foreignId('channel_id')
            ->constrained()
            ->cascadeOnUpdate()
            ->restrictOnDelete()
            ;
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ical_reservations');
    }
};
