<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->decimal('min_amount', 15, 2);
            $table->decimal('max_amount', 15, 2);
            $table->unsignedInteger('min_tenure_months');
            $table->unsignedInteger('max_tenure_months');
            $table->decimal('interest_rate', 5, 2);
            $table->decimal('processing_fee_percent', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->string('loan_number', 30)->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('bank_accounts')->cascadeOnDelete();
            $table->foreignId('loan_product_id')->constrained()->cascadeOnDelete();
            $table->enum('status', [
                'draft', 'submitted', 'under_review', 'additional_info_required',
                'approved', 'rejected', 'disbursed', 'active', 'closed'
            ])->default('draft');
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('approved_amount', 15, 2)->nullable();
            $table->decimal('interest_rate', 5, 2);
            $table->unsignedInteger('tenure_months');
            $table->decimal('emi', 15, 2)->nullable();
            $table->decimal('total_interest', 15, 2)->nullable();
            $table->decimal('total_repayment', 15, 2)->nullable();
            $table->timestamp('disbursed_at')->nullable();
            $table->date('first_emi_date')->nullable();
            $table->date('maturity_date')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->text('purpose');
            $table->enum('employment_type', ['salaried', 'self_employed', 'business', 'other']);
            $table->string('employer_name')->nullable();
            $table->unsignedInteger('employment_duration_months')->nullable();
            $table->decimal('monthly_salary', 15, 2);
            $table->decimal('existing_obligations', 15, 2)->default(0);
            $table->foreignId('approved_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
        });

        Schema::create('loan_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained()->cascadeOnDelete();
            $table->string('payment_number', 30);
            $table->date('due_date');
            $table->timestamp('paid_date')->nullable();
            $table->decimal('principal_component', 15, 2);
            $table->decimal('interest_component', 15, 2);
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['pending', 'paid', 'overdue', 'partial'])->default('pending');
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['loan_id', 'payment_number']);
            $table->index(['loan_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_payments');
        Schema::dropIfExists('loans');
        Schema::dropIfExists('loan_products');
    }
};