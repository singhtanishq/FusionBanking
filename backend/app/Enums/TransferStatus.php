<?php

namespace App\Enums;

enum TransferStatus: string
{
    case PENDING_VERIFICATION = 'pending_verification';
    case VERIFIED = 'verified';
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case EXPIRED = 'expired';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING_VERIFICATION => 'Pending Verification',
            self::VERIFIED => 'Verified',
            self::PROCESSING => 'Processing',
            self::COMPLETED => 'Completed',
            self::FAILED => 'Failed',
            self::EXPIRED => 'Expired',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING_VERIFICATION => 'amber',
            self::VERIFIED => 'blue',
            self::PROCESSING => 'blue',
            self::COMPLETED => 'emerald',
            self::FAILED => 'red',
            self::EXPIRED => 'gray',
            self::CANCELLED => 'gray',
        };
    }
}