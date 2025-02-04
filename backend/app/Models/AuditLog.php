<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $table = 'audit_logs';

    protected $fillable = [
        'actor_type',
        'actor_id',
        'action',
        'resource_type',
        'resource_id',
        'ip_address',
        'user_agent',
        'old_values',
        'new_values',
        'metadata',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
    ];

    public function actor(): \Illuminate\Database\Eloquent\Relations\MorphTo
    {
        return $this->morphTo('actor', 'actor_type', 'actor_id');
    }

    public function resource(): \Illuminate\Database\Eloquent\Relations\MorphTo
    {
        return $this->morphTo('resource', 'resource_type', 'resource_id');
    }

    public static function log(
        string $action,
        string $resourceType,
        $resourceId,
        $actor = null,
        array $oldValues = [],
        array $newValues = [],
        array $metadata = []
    ): void {
        self::create([
            // System-triggered events (no authenticated actor, e.g. public
            // application flows) are recorded under the reserved "system" actor.
            'actor_type' => $actor !== null ? get_class($actor) : 'system',
            'actor_id' => $actor !== null ? $actor->getKey() : 0,
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'ip_address' => request()->ip() ?? '0.0.0.0',
            'user_agent' => request()->userAgent(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'metadata' => $metadata,
        ]);
    }
}