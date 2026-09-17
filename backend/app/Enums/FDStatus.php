<?php

namespace App\Enums;

enum FDStatus: string
{
    case ACTIVE = 'active';
    case MATURED = 'matured';
    case PREMATURE_CLOSED = 'premature_closed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::MATURED => 'Matured',
            self::PREMATURE_CLOSED => 'Prematurely Closed',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::ACTIVE => 'emerald',
            self::MATURED => 'blue',
            self::PREMATURE_CLOSED => 'amber',
            self::CANCELLED => 'gray',
        };
    }
}