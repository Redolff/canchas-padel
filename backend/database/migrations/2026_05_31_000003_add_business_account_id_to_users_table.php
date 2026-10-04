<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('business_account_id')
                ->nullable()
                ->after('id')
                ->constrained('business_accounts')
                ->nullOnDelete();
            $table->string('role')->default('owner')->after('business_account_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['business_account_id']);
            $table->dropColumn(['business_account_id', 'role']);
        });
    }
};
