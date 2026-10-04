<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_accounts', function (Blueprint $table) {
            $table->integer('default_slot_price')->nullable()->after('slug');
        });

        // Backfill existing rows with the rate the controller was using
        // (11200 × 1.5 h = 16800 for a standard 90-min slot)
        DB::table('business_accounts')->update(['default_slot_price' => 16800]);
    }

    public function down(): void
    {
        Schema::table('business_accounts', function (Blueprint $table) {
            $table->dropColumn('default_slot_price');
        });
    }
};
