<?php

namespace App\Services;

use App\Models\Application;
use App\Models\ApplicationStep;
use App\Models\ApplicationReview;
use App\Models\ApplicationCorrection;
use App\Models\PersonalInformation;
use App\Models\ContactInformation;
use App\Models\AddressInformation;
use App\Models\KycInformation;
use App\Models\KycDocument;
use App\Models\Customer;
use App\Models\BankAccount;
use App\Models\VerificationToken;
use App\Enums\ApplicationStatus;
use App\Enums\ApplicationStepStatus;
use App\Enums\AccountStatus;
use App\Services\AccountService;
use App\Services\VerificationTokenService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class ApplicationService
{
    private const APPLICATION_STEPS = [
        ['key' => 'personal_info', 'name' => 'Personal Information', 'order' => 1],
        ['key' => 'contact_info', 'name' => 'Contact Details', 'order' => 2],
        ['key' => 'kyc_info', 'name' => 'KYC Information', 'order' => 3],
        ['key' => 'address_info', 'name' => 'Address Details', 'order' => 4],
        ['key' => 'documents', 'name' => 'Document Upload', 'order' => 5],
        ['key' => 'review', 'name' => 'Review & Submit', 'order' => 6],
    ];

    public function createDraftApplication(): Application
    {
        return DB::transaction(function () {
            $application = Application::create([
                'acknowledgement_number' => (new AccountService())->generateAcknowledgementNumber(),
                'status' => ApplicationStatus::DRAFT,
                'preferred_account_type' => 'savings',
            ]);

            // Create application steps
            foreach (self::APPLICATION_STEPS as $step) {
                ApplicationStep::create([
                    'application_id' => $application->id,
                    'step_key' => $step['key'],
                    'step_name' => $step['name'],
                    'step_order' => $step['order'],
                    'status' => ApplicationStepStatus::PENDING,
                ]);
            }

            return $application;
        });
    }

    public function savePersonalInformation(Application $application, array $data): PersonalInformation
    {
        return DB::transaction(function () use ($application, $data) {
            $info = PersonalInformation::updateOrCreate(
                ['application_id' => $application->id],
                array_merge($data, ['application_id' => $application->id])
            );

            $this->updateStepStatus($application, 'personal_info', ApplicationStepStatus::COMPLETED);
            $this->updateApplicationStatus($application);

            return $info;
        });
    }

    public function saveContactInformation(Application $application, array $data): ContactInformation
    {
        return DB::transaction(function () use ($application, $data) {
            $info = ContactInformation::updateOrCreate(
                ['application_id' => $application->id],
                array_merge($data, ['application_id' => $application->id])
            );

            $this->updateStepStatus($application, 'contact_info', ApplicationStepStatus::COMPLETED);
            $this->updateApplicationStatus($application);

            return $info;
        });
    }

    public function saveAddressInformation(Application $application, array $data): AddressInformation
    {
        return DB::transaction(function () use ($application, $data) {
            $info = AddressInformation::updateOrCreate(
                ['application_id' => $application->id],
                array_merge($data, ['application_id' => $application->id])
            );

            $this->updateStepStatus($application, 'address_info', ApplicationStepStatus::COMPLETED);
            $this->updateApplicationStatus($application);

            return $info;
        });
    }

    public function saveKycInformation(Application $application, array $data): KycInformation
    {
        return DB::transaction(function () use ($application, $data) {
            $info = KycInformation::updateOrCreate(
                ['application_id' => $application->id],
                array_merge($data, ['application_id' => $application->id])
            );

            $this->updateStepStatus($application, 'kyc_info', ApplicationStepStatus::COMPLETED);
            $this->updateApplicationStatus($application);

            return $info;
        });
    }

    public function uploadDocument(Application $application, string $stepKey, array $fileData): KycDocument
    {
        $step = $application->steps()->where('step_key', $stepKey)->first();
        
        if (!$step) {
            throw new Exception('Invalid step for document upload');
        }

        return DB::transaction(function () use ($application, $step, $fileData) {
            $document = KycDocument::create([
                'application_id' => $application->id,
                'application_step_id' => $step->id,
                'document_type' => $fileData['document_type'],
                'document_category' => $fileData['document_category'],
                'original_filename' => $fileData['original_filename'],
                'stored_filename' => $fileData['stored_filename'],
                'mime_type' => $fileData['mime_type'],
                'file_size' => $fileData['file_size'],
                'file_path' => $fileData['file_path'],
            ]);

            // Check if all required documents for this step are uploaded
            $this->checkStepDocumentsComplete($application, $stepKey);

            return $document;
        });
    }

    public function submitApplication(Application $application): void
    {
        // Validate all required steps are completed
        $incompleteSteps = $application->steps()
            ->whereIn('step_key', ['personal_info', 'contact_info', 'kyc_info', 'address_info', 'documents'])
            ->where('status', '!=', ApplicationStepStatus::COMPLETED)
            ->count();

        if ($incompleteSteps > 0) {
            throw new Exception('All required steps must be completed before submission');
        }

        // Validate required documents
        $this->validateRequiredDocuments($application);

        DB::transaction(function () use ($application) {
            $application->update([
                'status' => ApplicationStatus::SUBMITTED,
                'submitted_at' => now(),
            ]);

            // Update all steps to pending review
            $application->steps()
                ->whereIn('step_key', ['personal_info', 'contact_info', 'kyc_info', 'address_info', 'documents'])
                ->update(['status' => ApplicationStepStatus::IN_REVIEW]);

            // Send confirmation email
            $this->sendSubmissionConfirmation($application);

            // Log audit
            \App\Models\AuditLog::log(
                'application_submitted',
                'application',
                $application->id,
                null, // No authenticated user yet
                [],
                ['status' => ApplicationStatus::SUBMITTED->value]
            );
        });
    }

    public function reviewStep(\App\Models\Admin $admin, Application $application, string $stepKey, string $action, string $reason): void
    {
        $step = $application->steps()->where('step_key', $stepKey)->first();
        
        if (!$step) {
            throw new Exception('Invalid step');
        }

        if (!in_array($step->status, [ApplicationStepStatus::IN_REVIEW, ApplicationStepStatus::CORRECTION_SUBMITTED])) {
            throw new Exception('Step is not in review');
        }

        DB::transaction(function () use ($admin, $application, $step, $action, $reason) {
            $oldStatus = $step->status;
            $newStatus = match ($action) {
                'approve' => ApplicationStepStatus::VERIFIED,
                'reject' => ApplicationStepStatus::REJECTED,
                'request_correction' => ApplicationStepStatus::CORRECTION_REQUIRED,
                default => throw new Exception('Invalid action'),
            };

            $step->update([
                'status' => $newStatus,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'rejection_reason' => $action === 'reject' || $action === 'request_correction' ? $reason : null,
            ]);

            // Create review record
            ApplicationReview::create([
                'application_id' => $application->id,
                'application_step_id' => $step->id,
                'admin_id' => $admin->id,
                'action' => $action,
                'previous_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $reason,
            ]);

            // Update application status
            $this->updateApplicationStatus($application);

            // If rejected and requesting correction, send notification
            if ($action === 'request_correction') {
                $this->initiateCorrection($application, $step);
            }

            // Log audit
            \App\Models\AuditLog::log(
                'application_step_reviewed',
                'application_step',
                $step->id,
                $admin,
                ['status' => $oldStatus->value],
                ['status' => $newStatus->value, 'action' => $action]
            );
        });
    }

    public function submitCorrection(Application $application, string $stepKey, array $data, string $token): ApplicationCorrection
    {
        $step = $application->steps()->where('step_key', $stepKey)->first();
        
        if (!$step || $step->status !== ApplicationStepStatus::CORRECTION_REQUIRED) {
            throw new Exception('No correction required for this step');
        }

        // Verify token
        $verificationToken = VerificationToken::where('token_hash', VerificationToken::hashToken($token))
            ->where('purpose', \App\Enums\VerificationPurpose::APPLICATION_CORRECTION)
            ->where('resource_type', Application::class)
            ->where('resource_id', $application->id)
            ->where('is_used', false)
            ->where('is_revoked', false)
            ->first();

        if (!$verificationToken || !$verificationToken->isValid()) {
            $verificationToken?->incrementAttempts();
            throw new Exception('Invalid or expired correction token');
        }

        return DB::transaction(function () use ($application, $step, $data, $verificationToken, $stepKey) {
            $correction = ApplicationCorrection::create([
                'application_id' => $application->id,
                'application_step_id' => $step->id,
                'verification_token_id' => $verificationToken->id,
                'submitted_at' => now(),
                'status' => ApplicationStepStatus::CORRECTION_SUBMITTED,
                'submitted_data' => $data,
            ]);

            // Update step status
            $step->update(['status' => ApplicationStepStatus::CORRECTION_SUBMITTED]);

            // Update application status
            $application->update(['status' => ApplicationStatus::CORRECTION_REQUIRED]);

            $verificationToken->markAsUsed();

            // Log audit
            \App\Models\AuditLog::log(
                'application_correction_submitted',
                'application_correction',
                $correction->id,
                $application->customer ?? null,
                [],
                ['step' => $stepKey]
            );

            return $correction;
        });
    }

    public function generateCorrectionToken(Application $application, ApplicationStep $step): string
    {
        $service = new VerificationTokenService();
        $result = $service->generateToken(
            $application->customer,
            \App\Enums\VerificationPurpose::APPLICATION_CORRECTION,
            Application::class,
            $application->id
        );

        return $result['token'];
    }

    public function approveApplication(\App\Models\Admin $admin, Application $application): void
    {
        if ($application->status !== ApplicationStatus::FINAL_REVIEW && 
            $application->status !== ApplicationStatus::UNDER_REVIEW) {
            throw new Exception('Application is not ready for final approval');
        }

        // Check all steps are verified
        $unverifiedSteps = $application->steps()
            ->whereIn('step_key', ['personal_info', 'contact_info', 'kyc_info', 'address_info', 'documents'])
            ->where('status', '!=', ApplicationStepStatus::VERIFIED)
            ->count();

        if ($unverifiedSteps > 0) {
            throw new Exception('All verification steps must be completed before approval');
        }

        DB::transaction(function () use ($admin, $application) {
            $accountService = new AccountService();
            
            // Create customer
            $customer = Customer::create([
                'customer_id' => $accountService->generateCustomerId(),
                'application_id' => $application->id,
                'email' => $application->contactInfo->email,
                'mobile' => $application->contactInfo->mobile_number,
                'alternate_mobile' => $application->contactInfo->alternate_mobile,
                'full_name' => $application->personalInfo->full_name,
                'father_name' => $application->personalInfo->father_name,
                'mother_name' => $application->personalInfo->mother_name,
                'date_of_birth' => $application->personalInfo->date_of_birth,
                'gender' => $application->personalInfo->gender,
                'marital_status' => $application->personalInfo->marital_status,
                'nationality' => $application->personalInfo->nationality,
                'occupation' => $application->personalInfo->occupation,
                'annual_income' => $application->personalInfo->annual_income,
                'pan_number' => $application->kycInfo->pan_number,
                'aadhaar_number' => $application->kycInfo->aadhaar_number,
                'kyc_type' => $application->kycInfo->kyc_type,
                'kyc_verified_at' => now(),
                'password' => bcrypt(Str::random(16)), // Temporary, will be set during NetBanking activation
                'is_active' => true,
            ]);

            // Create addresses
            $this->createCustomerAddresses($customer, $application);

            // Create bank account
            $account = BankAccount::create([
                'customer_id' => $customer->id,
                'account_number' => $accountService->generateAccountNumber(),
                'ifsc_code' => config('app.fusion_demo_ifsc', 'FUSB0001001'),
                'account_type' => $application->preferred_account_type,
                'status' => AccountStatus::ACTIVE,
                'balance' => 0,
                'available_balance' => 0,
                'opening_date' => now(),
                'is_primary' => true,
            ]);

            // Create initial deposit
            $accountService->createInitialDeposit($account, config('app.fusion_initial_deposit', 100000));

            // Update application
            $application->update([
                'status' => ApplicationStatus::ACCOUNT_ACTIVE,
                'customer_id' => $customer->id,
                'approved_at' => now(),
            ]);

            // Update all steps to completed
            $application->steps()
                ->whereIn('step_key', ['personal_info', 'contact_info', 'kyc_info', 'address_info', 'documents', 'review'])
                ->update(['status' => ApplicationStepStatus::COMPLETED]);

            // Send welcome email
            $customer->notify(new \App\Notifications\WelcomeEmailNotification($customer, $account));

            // Log audit
            \App\Models\AuditLog::log(
                'application_approved_account_created',
                'application',
                $application->id,
                $admin,
                ['status' => $application->getOriginal('status')],
                [
                    'status' => ApplicationStatus::ACCOUNT_ACTIVE->value,
                    'customer_id' => $customer->customer_id,
                    'account_number' => $account->account_number
                ]
            );
        });
    }

    private function updateStepStatus(Application $application, string $stepKey, ApplicationStepStatus $status): void
    {
        $application->steps()->where('step_key', $stepKey)->update(['status' => $status]);
    }

    private function updateApplicationStatus(Application $application): void
    {
        $steps = $application->steps()
            ->whereIn('step_key', ['personal_info', 'contact_info', 'kyc_info', 'address_info', 'documents'])
            ->get();

        $hasRejected = $steps->contains('status', ApplicationStepStatus::REJECTED);
        $hasCorrectionRequired = $steps->contains('status', ApplicationStepStatus::CORRECTION_REQUIRED);
        $hasCorrectionSubmitted = $steps->contains('status', ApplicationStepStatus::CORRECTION_SUBMITTED);
        $allVerified = $steps->every(fn($s) => $s->status === ApplicationStepStatus::VERIFIED);
        $allCompletedOrVerified = $steps->every(fn($s) => in_array($s->status, [ApplicationStepStatus::VERIFIED, ApplicationStepStatus::COMPLETED]));

        $newStatus = match (true) {
            $hasRejected || $hasCorrectionRequired => ApplicationStatus::CORRECTION_REQUIRED,
            $hasCorrectionSubmitted => ApplicationStatus::CORRECTION_REQUIRED,
            $allCompletedOrVerified => ApplicationStatus::FINAL_REVIEW,
            $steps->contains('status', ApplicationStepStatus::IN_REVIEW) => ApplicationStatus::UNDER_REVIEW,
            default => ApplicationStatus::SUBMITTED,
        };

        $application->update(['status' => $newStatus]);
    }

    private function checkStepDocumentsComplete(Application $application, string $stepKey): void
    {
        $step = $application->steps()->where('step_key', $stepKey)->first();
        
        if (!$step) return;

        // Check if documents exist for this step
        $hasDocuments = KycDocument::where('application_step_id', $step->id)->exists();
        
        if ($hasDocuments && $step->status === ApplicationStepStatus::PENDING) {
            $step->update(['status' => ApplicationStepStatus::COMPLETED]);
            $this->updateApplicationStatus($application);
        }
    }

    private function validateRequiredDocuments(Application $application): void
    {
        $requiredCategories = ['identity_proof', 'address_proof'];
        
        foreach ($requiredCategories as $category) {
            $exists = KycDocument::where('application_id', $application->id)
                ->where('document_category', $category)
                ->exists();

            if (!$exists) {
                throw new Exception("Required document category '{$category}' is missing");
            }
        }
    }

    private function initiateCorrection(Application $application, ApplicationStep $step): void
    {
        // Generate correction token
        $token = $this->generateCorrectionToken($application, $step);
        
        // Send email with correction token
        if ($application->customer) {
            $application->customer->notify(new \App\Notifications\CorrectionVerificationNotification($application, $step, $token));
        }
    }

    private function createCustomerAddresses(Customer $customer, Application $application): void
    {
        $contact = $application->contactInfo;
        $address = $application->addressInfo;

        // Create residential address
        \App\Models\CustomerAddress::create([
            'customer_id' => $customer->id,
            'type' => 'residential',
            'address_line_1' => $address->residential_address_line_1,
            'address_line_2' => $address->residential_address_line_2,
            'city' => $address->residential_city,
            'state' => $address->residential_state,
            'postal_code' => $address->residential_postal_code,
            'country' => $address->residential_country,
            'landmark' => $address->residential_landmark,
            'is_primary' => true,
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        // Create permanent address if different
        if (!$address->same_as_residential) {
            \App\Models\CustomerAddress::create([
                'customer_id' => $customer->id,
                'type' => 'permanent',
                'address_line_1' => $address->permanent_address_line_1,
                'address_line_2' => $address->permanent_address_line_2,
                'city' => $address->permanent_city,
                'state' => $address->permanent_state,
                'postal_code' => $address->permanent_postal_code,
                'country' => $address->permanent_country,
                'landmark' => $address->permanent_landmark,
                'is_primary' => false,
                'is_verified' => true,
                'verified_at' => now(),
            ]);
        }
    }

    private function sendSubmissionConfirmation(Application $application): void
    {
        // This would be sent via queue in production
        // For now, we'll just log it
        \App\Models\AuditLog::log(
            'application_submission_email_sent',
            'application',
            $application->id,
            null,
            [],
            ['acknowledgement_number' => $application->acknowledgement_number]
        );
    }
}