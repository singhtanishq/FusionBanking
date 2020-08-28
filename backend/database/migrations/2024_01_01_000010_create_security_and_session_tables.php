<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('event_type');
            $table->text('description');
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->enum('severity', ['info', 'warning', 'critical'])->default('info');
            $table->timestamps();

            $table->index(['customer_id', 'created_at']);
            $table->index(['admin_id', 'created_at']);
            $table->index(['event_type', 'created_at']);
        });

        Schema::create('customer_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('session_token', 64)->unique();
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->json('device_info')->nullable();
            $table->timestamp('last_activity_at');
            $table->timestamp('expires_at');
            $table->boolean('is_revoked')->default(false);
            $table->timestamps();

            $table->index(['customer_id', 'is_revoked']);
            $table->index('session_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_sessions');
        Schema::dropIfExists('security_events');
    }
};