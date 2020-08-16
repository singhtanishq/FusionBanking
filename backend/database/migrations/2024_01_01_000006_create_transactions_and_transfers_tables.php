<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_id', 30)->unique();
            $table->string('reference_number', 30)->unique();
            $table->foreignId('sender_account_id')->constrained('bank_accounts')->cascadeOnDelete();
            $table->foreignId('receiver_account_id')->constrained('bank_accounts')->cascadeOnDelete();
            $table->foreignId('sender_customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('receiver_customer_id')->constrained('customers')->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->decimal('fee', 18, 2)->default(0);
            $table->decimal('total_debit', 18, 2);
            $table->enum('transfer_type', ['imps', 'neft', 'rtgs', 'internal'])->default('internal');
            $table->text('remark')->nullable();
            $table->enum('status', [
                'pending_verification', 'verified', 'processing',
                'completed', 'failed', 'expired', 'cancelled'
            ])->default('pending_verification');
            $table->foreignId('verification_token_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->string('idempotency_key', 64)->unique();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['sender_account_id', 'status']);
            $table->index(['receiver_account_id', 'status']);
            $table->index('reference_number');
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id', 30)->unique();
            $table->string('reference_number', 30)->unique();
            $table->foreignId('account_id')->constrained('bank_accounts')->cascadeOnDelete();
            $table->foreignId('related_account_id')->nullable()->constrained('bank_accounts')->nullOnDelete();
            $table->foreignId('transfer_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', [
                'cash_deposit', 'money_sent', 'money_received',
                'loan_disbursement', 'loan_repayment',
                'fd_creation', 'fd_maturity',
                'interest_credit', 'refund', 'adjustment', 'reversal'
            ]);
            $table->enum('direction', ['credit', 'debit', 'adjustment']);
            $table->decimal('amount', 18, 2);
            $table->decimal('opening_balance', 18, 2);
            $table->decimal('closing_balance', 18, 2);
            $table->string('currency', 3)->default('INR');
            $table->enum('status', ['pending', 'completed', 'failed', 'reversed'])->default('completed');
            $table->text('description')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['account_id', 'created_at']);
            $table->index(['transfer_id']);
            $table->index('reference_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('transfers');
    }
};