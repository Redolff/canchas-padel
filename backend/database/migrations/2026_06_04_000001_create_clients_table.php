<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_account_id')->constrained()->cascadeOnDelete();
            $table->string('nombre');
            $table->string('apellido')->nullable();
            $table->string('telefono');
            $table->string('dni')->nullable();
            $table->timestamps();
            $table->unique(['business_account_id', 'telefono']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
