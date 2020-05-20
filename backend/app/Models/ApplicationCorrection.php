<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\ApplicationStepStatus;

class ApplicationCorrection extends Model
{
    use HasFactory;

    protected $table = 'application_corrections';

    protected $fillable = [
        'application_id',
        'application_step_id',
        'verification_token_id',
        'submitted_at',
        'reviewed_at',
        'status',
        'submitted_data',
        'review_notes',
        'metadata',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'status' => ApplicationStepStatus::class,
        'submitted_data' => 'array',
        'metadata' => 'array',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(ApplicationStep::class, 'application_step_id');
    }

    public function verificationToken(): BelongsTo
    {
        return $this->belongsTo(VerificationToken::class, 'verification_token_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(KycDocument::class, 'application_correction_id');
    }
}