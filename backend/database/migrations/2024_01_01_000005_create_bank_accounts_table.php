<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('account_number', 20)->unique();
            $table->string('ifsc_code', 15);
            $table->enum('account_type', ['savings', 'current']);
            $table->enum('status', ['pending', 'active', 'restricted', 'frozen', 'closed'])->default('pending');
            $table->decimal('balance', 18, 2)->default(0);
            $table->decimal('available_balance', 18, 2)->default(0);
            $table->date('opening_date');
            $table->date('closing_date')->nullable();
            $table->boolean('is_primary')->default(true);
            $table->timestamp('frozen_at')->nullable();
            $table->foreignId('frozen_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->text('frozen_reason')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('closed_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->text('closed_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
            $table->index('account_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};