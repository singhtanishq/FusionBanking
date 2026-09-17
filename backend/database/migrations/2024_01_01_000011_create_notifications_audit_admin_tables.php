<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->string('action_url')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->timestamps();

            $table->index(['customer_id', 'read_at']);
            $table->index(['admin_id', 'read_at']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('actor_type');
            $table->unsignedBigInteger('actor_id');
            $table->string('action');
            $table->string('resource_type');
            $table->unsignedBigInteger('resource_id');
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['actor_type', 'actor_id']);
            $table->index(['resource_type', 'resource_id']);
            $table->index(['action', 'created_at']);
        });

        Schema::create('admin_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained()->cascadeOnDelete();
            $table->string('notable_type');
            $table->unsignedBigInteger('notable_id');
            $table->text('note');
            $table->boolean('is_internal')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['notable_type', 'notable_id']);
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->enum('type', ['string', 'integer', 'float', 'boolean', 'json'])->default('string');
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->string('group')->nullable();
            $table->json('validation_rules')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('admin_notes');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
    }
};