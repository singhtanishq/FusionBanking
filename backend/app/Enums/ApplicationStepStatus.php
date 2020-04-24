<?php

namespace App\Enums;

enum ApplicationStepStatus: string
{
    case PENDING = 'pending';
    case IN_REVIEW = 'in_review';
    case VERIFIED = 'verified';
    case REJECTED = 'rejected';
    case CORRECTION_REQUIRED = 'correction_required';
    case CORRECTION_SUBMITTED = 'correction_submitted';
    case COMPLETED = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::IN_REVIEW => 'In Review',
            self::VERIFIED => 'Verified',
            self::REJECTED => 'Rejected',
            self::CORRECTION_REQUIRED => 'Correction Required',
            self::CORRECTION_SUBMITTED => 'Correction Submitted',
            self::COMPLETED => 'Completed',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'gray',
            self::IN_REVIEW => 'amber',
            self::VERIFIED => 'emerald',
            self::REJECTED => 'red',
            self::CORRECTION_REQUIRED => 'red',
            self::CORRECTION_SUBMITTED => 'blue',
            self::COMPLETED => 'emerald',
        };
    }
}