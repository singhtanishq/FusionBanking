<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case UNDER_REVIEW = 'under_review';
    case PARTIALLY_APPROVED = 'partially_approved';
    case CORRECTION_REQUIRED = 'correction_required';
    case KYC_REVIEW = 'kyc_review';
    case FINAL_REVIEW = 'final_review';
    case APPROVED = 'approved';
    case ACCOUNT_CREATION_PENDING = 'account_creation_pending';
    case ACCOUNT_ACTIVE = 'account_active';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Submitted',
            self::UNDER_REVIEW => 'Under Review',
            self::PARTIALLY_APPROVED => 'Partially Approved',
            self::CORRECTION_REQUIRED => 'Correction Required',
            self::KYC_REVIEW => 'KYC Review',
            self::FINAL_REVIEW => 'Final Review',
            self::APPROVED => 'Approved',
            self::ACCOUNT_CREATION_PENDING => 'Account Creation Pending',
            self::ACCOUNT_ACTIVE => 'Account Active',
            self::REJECTED => 'Rejected',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::SUBMITTED => 'blue',
            self::UNDER_REVIEW => 'amber',
            self::PARTIALLY_APPROVED => 'amber',
            self::CORRECTION_REQUIRED => 'red',
            self::KYC_REVIEW => 'amber',
            self::FINAL_REVIEW => 'amber',
            self::APPROVED => 'emerald',
            self::ACCOUNT_CREATION_PENDING => 'blue',
            self::ACCOUNT_ACTIVE => 'emerald',
            self::REJECTED => 'red',
        };
    }
}