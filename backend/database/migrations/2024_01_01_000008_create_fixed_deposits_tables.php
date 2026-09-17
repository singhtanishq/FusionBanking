<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fd_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->decimal('min_amount', 15, 2);
            $table->decimal('max_amount', 15, 2);
            $table->unsignedInteger('min_tenure_months');
            $table->unsignedInteger('max_tenure_months');
            $table->decimal('interest_rate', 5, 2);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('fixed_deposits', function (Blueprint $table) {
            $table->id();
            $table->string('fd_number', 30)->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('bank_accounts')->cascadeOnDelete();
            $table->foreignId('fd_product_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['active', 'matured', 'premature_closed', 'cancelled'])->default('active');
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2);
            $table->unsignedInteger('tenure_months');
            $table->decimal('maturity_amount', 15, 2);
            $table->date('maturity_date');
            $table->timestamp('opened_at');
            $table->timestamp('matured_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('closed_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->boolean('auto_renew')->default(false);
            $table->unsignedInteger('renewal_count')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fixed_deposits');
        Schema::dropIfExists('fd_products');
    }
};