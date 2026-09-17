<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('account_number', 20);
            $table->string('ifsc_code', 15);
            $table->string('nickname')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verification_token_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('cooling_period_ends_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'is_verified']);
        });

        Schema::create('verification_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('token_hash', 64);
            $table->foreignId('customer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained()->cascadeOnDelete();
            $table->enum('purpose', [
                'application_correction', 'netbanking_activation', 'login_otp',
                'password_reset', 'transfer_verification', 'beneficiary_verification',
                'email_verification', 'admin_login'
            ]);
            $table->string('resource_type')->nullable();
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->unsignedInteger('attempts')->default(0);
            $table->unsignedInteger('max_attempts')->default(3);
            $table->boolean('is_used')->default(false);
            $table->boolean('is_revoked')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'purpose', 'is_used']);
            $table->index(['token_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_tokens');
        Schema::dropIfExists('beneficiaries');
    }
};