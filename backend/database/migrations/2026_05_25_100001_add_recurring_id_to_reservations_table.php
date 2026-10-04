<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('recurring_id')
                  ->nullable()
                  ->after('is_open')
                  ->constrained('recurring_reservations')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['recurring_id']);
            $table->dropColumn('recurring_id');
        });
    }
};
