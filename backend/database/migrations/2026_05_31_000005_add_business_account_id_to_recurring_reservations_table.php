<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recurring_reservations', function (Blueprint $table) {
            $table->foreignId('business_account_id')
                ->nullable()
                ->after('id')
                ->constrained('business_accounts')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('recurring_reservations', function (Blueprint $table) {
            $table->dropForeign(['business_account_id']);
            $table->dropColumn('business_account_id');
        });
    }
};
