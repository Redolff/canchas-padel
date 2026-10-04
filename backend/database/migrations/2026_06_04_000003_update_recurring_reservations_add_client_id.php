<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recurring_reservations', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->dropColumn(['name', 'email']);
        });
    }

    public function down(): void
    {
        Schema::table('recurring_reservations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('client_id');
            $table->string('name')->default('');
            $table->string('email')->nullable();
        });
    }
};
