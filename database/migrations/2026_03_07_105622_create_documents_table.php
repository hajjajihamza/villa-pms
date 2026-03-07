<?php

use App\Enums\DocTypeEnum;
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
        Schema::create('documents', function (Blueprint $table): void {
            $table->id();
            $table->string('file_path');
            $table->enum('type', [
                DocTypeEnum::ID_CARD,
                DocTypeEnum::PASSPORT,
                DocTypeEnum::DRIVERS_LICENSE,
                DocTypeEnum::RESIDENCE_CARD,
            ]);
            $table->foreignId('visitor_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
