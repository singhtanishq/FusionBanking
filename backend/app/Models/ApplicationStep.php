<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\ApplicationStepStatus;

class ApplicationStep extends Model
{
    use HasFactory;

    protected $table = 'application_steps';

    protected $fillable = [
        'application_id',
        'step_key',
        'step_name',
        'step_order',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
        'rejection_details',
        'metadata',
    ];

    protected $casts = [
        'status' => ApplicationStepStatus::class,
        'reviewed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'reviewed_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(KycDocument::class, 'application_step_id');
    }
}