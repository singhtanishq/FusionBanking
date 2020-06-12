<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\VerificationPurpose;

class VerificationToken extends Model
{
    use HasFactory;

    protected $table = 'verification_tokens';

    protected $fillable = [
        'token_hash',
        'customer_id',
        'admin_id',
        'purpose',
        'resource_type',
        'resource_id',
        'expires_at',
        'used_at',
        'attempts',
        'max_attempts',
        'is_used',
        'is_revoked',
        'metadata',
    ];

    protected $casts = [
        'purpose' => VerificationPurpose::class,
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'is_used' => 'boolean',
        'is_revoked' => 'boolean',
        'metadata' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    public function isValid(): bool
    {
        return !$this->is_used 
            && !$this->is_revoked 
            && $this->expires_at->isFuture() 
            && $this->attempts < $this->max_attempts;
    }

    public function incrementAttempts(): void
    {
        $this->increment('attempts');
        if ($this->attempts >= $this->max_attempts) {
            $this->update(['is_revoked' => true]);
        }
    }

    public function markAsUsed(): void
    {
        $this->update([
            'is_used' => true,
            'used_at' => now(),
        ]);
    }

    public static function generateToken(int $length = 16): string
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $token = '';
        for ($i = 0; $i < $length; $i++) {
            $token .= $characters[random_int(0, strlen($characters) - 1)];
        }
        return $token;
    }

    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }
}