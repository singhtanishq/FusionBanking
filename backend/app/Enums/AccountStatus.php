<?php

namespace App\Enums;

enum AccountStatus: string
{
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case RESTRICTED = 'restricted';
    case FROZEN = 'frozen';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::ACTIVE => 'Active',
            self::RESTRICTED => 'Restricted',
            self::FROZEN => 'Frozen',
            self::CLOSED => 'Closed',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'gray',
            self::ACTIVE => 'emerald',
            self::RESTRICTED => 'amber',
            self::FROZEN => 'red',
            self::CLOSED => 'gray',
        };
    }

    public function canTransact(): bool
    {
        return $this === self::ACTIVE;
    }
}