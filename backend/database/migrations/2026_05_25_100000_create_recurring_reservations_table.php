<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_reservations', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('court_id');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('start_hour', 5, 2);
            $table->decimal('duration', 4, 2);
            $table->string('type');
            $table->string('name');
            $table->unsignedTinyInteger('players')->default(4);
            $table->string('email')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_reservations');
    }
};
