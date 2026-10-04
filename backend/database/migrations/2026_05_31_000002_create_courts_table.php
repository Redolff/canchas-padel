<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_account_id')->constrained('business_accounts')->cascadeOnDelete();
            $table->string('name');
            $table->string('surface'); // turf | clay | blue
            $table->string('location'); // Indoor | Outdoor
            $table->boolean('has_glass')->default(false);
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courts');
    }
};
