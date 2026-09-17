<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('acknowledgement_number', 30)->unique();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', [
                'draft', 'submitted', 'under_review', 'partially_approved',
                'correction_required', 'kyc_review', 'final_review',
                'approved', 'account_creation_pending', 'account_active', 'rejected'
            ])->default('draft');
            $table->enum('preferred_account_type', ['savings', 'current'])->default('savings');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('application_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('step_key');
            $table->string('step_name');
            $table->unsignedInteger('step_order');
            $table->enum('status', [
                'pending', 'in_review', 'verified', 'rejected',
                'correction_required', 'correction_submitted', 'completed'
            ])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('rejection_details')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('application_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_step_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('admin_id')->constrained()->cascadeOnDelete();
            $table->enum('action', ['approve', 'reject', 'request_correction']);
            $table->enum('previous_status', [
                'pending', 'in_review', 'verified', 'rejected',
                'correction_required', 'correction_submitted', 'completed'
            ]);
            $table->enum('new_status', [
                'pending', 'in_review', 'verified', 'rejected',
                'correction_required', 'correction_submitted', 'completed'
            ]);
            $table->text('reason');
            $table->json('details')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('application_corrections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_step_id')->constrained()->cascadeOnDelete();
            $table->foreignId('verification_token_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->enum('status', [
                'pending', 'in_review', 'verified', 'rejected',
                'correction_required', 'correction_submitted', 'completed'
            ])->default('pending');
            $table->json('submitted_data')->nullable();
            $table->text('review_notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_corrections');
        Schema::dropIfExists('application_reviews');
        Schema::dropIfExists('application_steps');
        Schema::dropIfExists('applications');
    }
};