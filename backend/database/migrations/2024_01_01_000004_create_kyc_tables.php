<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->string('father_name');
            $table->string('mother_name');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed']);
            $table->string('nationality', 100);
            $table->string('occupation');
            $table->decimal('annual_income', 15, 2);
            $table->enum('preferred_account_type', ['savings', 'current']);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('mobile_number', 20);
            $table->string('email');
            $table->string('alternate_mobile', 20)->nullable();
            $table->string('address_line_1');
            $table->string('address_line_2')->nullable();
            $table->string('city');
            $table->string('state');
            $table->string('postal_code', 10);
            $table->string('country', 100)->default('India');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('address_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('residential_address_line_1');
            $table->string('residential_address_line_2')->nullable();
            $table->string('residential_city');
            $table->string('residential_state');
            $table->string('residential_postal_code', 10);
            $table->string('residential_country', 100)->default('India');
            $table->string('residential_landmark')->nullable();
            $table->string('permanent_address_line_1');
            $table->string('permanent_address_line_2')->nullable();
            $table->string('permanent_city');
            $table->string('permanent_state');
            $table->string('permanent_postal_code', 10);
            $table->string('permanent_country', 100)->default('India');
            $table->string('permanent_landmark')->nullable();
            $table->boolean('same_as_residential')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('kyc_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('pan_number', 10);
            $table->string('aadhaar_number', 12);
            $table->string('kyc_type');
            $table->json('identity_verification_metadata')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('kyc_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_step_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('application_correction_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('document_type', [
                'pan', 'passport', 'voter_id', 'driving_license',
                'aadhaar', 'utility_bill', 'bank_statement'
            ]);
            $table->enum('document_category', ['identity_proof', 'address_proof']);
            $table->string('original_filename');
            $table->string('stored_filename');
            $table->string('mime_type');
            $table->unsignedInteger('file_size');
            $table->string('file_path');
            $table->boolean('is_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kyc_documents');
        Schema::dropIfExists('kyc_information');
        Schema::dropIfExists('address_information');
        Schema::dropIfExists('contact_information');
        Schema::dropIfExists('personal_information');
    }
};