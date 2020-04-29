<?php

namespace App\Enums;

enum LoanStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case UNDER_REVIEW = 'under_review';
    case ADDITIONAL_INFO_REQUIRED = 'additional_info_required';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case DISBURSED = 'disbursed';
    case ACTIVE = 'active';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Submitted',
            self::UNDER_REVIEW => 'Under Review',
            self::ADDITIONAL_INFO_REQUIRED => 'Additional Info Required',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::DISBURSED => 'Disbursed',
            self::ACTIVE => 'Active',
            self::CLOSED => 'Closed',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::SUBMITTED => 'blue',
            self::UNDER_REVIEW => 'amber',
            self::ADDITIONAL_INFO_REQUIRED => 'amber',
            self::APPROVED => 'emerald',
            self::REJECTED => 'red',
            self::DISBURSED => 'blue',
            self::ACTIVE => 'emerald',
            self::CLOSED => 'gray',
        };
    }
}