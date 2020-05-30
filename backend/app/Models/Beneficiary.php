<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Beneficiary extends Model
{
    use HasFactory;

    protected $table = 'beneficiaries';

    protected $fillable = [
        'customer_id',
        'name',
        'account_number',
        'ifsc_code',
        'nickname',
        'is_verified',
        'verified_at',
        'verification_token_id',
        'cooling_period_ends_at',
        'metadata',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'cooling_period_ends_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function verificationToken(): BelongsTo
    {
        return $this->belongsTo(VerificationToken::class, 'verification_token_id');
    }

    public function getMaskedAccountNumber(): string
    {
        return 'XXXXXX' . substr($this->account_number, -4);
    }

    public function isInCoolingPeriod(): bool
    {
        return $this->cooling_period_ends_at && $this->cooling_period_ends_at->isFuture();
    }
}