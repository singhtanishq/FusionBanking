<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerSession extends Model
{
    use HasFactory;

    protected $table = 'customer_sessions';

    protected $fillable = [
        'customer_id',
        'session_token',
        'ip_address',
        'user_agent',
        'device_info',
        'last_activity_at',
        'expires_at',
        'is_revoked',
    ];

    protected $casts = [
        'last_activity_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_revoked' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function isActive(): bool
    {
        return !$this->is_revoked && $this->expires_at->isFuture();
    }

    public function revoke(): void
    {
        $this->update(['is_revoked' => true]);
    }
}