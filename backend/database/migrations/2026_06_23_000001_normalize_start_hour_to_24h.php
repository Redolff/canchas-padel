<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('UPDATE reservations SET start_hour = start_hour + 8');
        DB::statement('UPDATE recurring_reservations SET start_hour = start_hour + 8');
    }

    public function down(): void
    {
        DB::statement('UPDATE reservations SET start_hour = start_hour - 8');
        DB::statement('UPDATE recurring_reservations SET start_hour = start_hour - 8');
    }
};
