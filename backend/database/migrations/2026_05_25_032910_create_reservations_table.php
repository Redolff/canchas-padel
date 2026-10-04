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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('booking_ref')->unique();
            $table->unsignedInteger('court_id');
            $table->date('date');
            $table->decimal('start_hour', 5, 2);
            $table->decimal('duration', 4, 2);
            $table->string('type');
            $table->string('name');
            $table->unsignedTinyInteger('players')->default(4);
            $table->string('email')->nullable();
            $table->unsignedInteger('total')->default(0);
            $table->string('status')->default('pending');
            $table->boolean('is_open')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
