<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityEvent extends Model
{
    use HasFactory;

    protected $table = 'security_events';

    protected $fillable = [
        'customer_id',
        'admin_id',
        'event_type',
        'description',
        'ip_address',
        'user_agent',
        'metadata',
        'severity',
    ];

    protected $casts = [
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

    public static function log(string $eventType, string $description, array $metadata = [], string $severity = 'info', ?int $customerId = null, ?int $adminId = null): void
    {
        self::create([
            'customer_id' => $customerId,
            'admin_id' => $adminId,
            'event_type' => $eventType,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => $metadata,
            'severity' => $severity,
        ]);
    }
}