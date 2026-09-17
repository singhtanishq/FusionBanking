<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\ApplicationStatus;
use App\Enums\ApplicationStepStatus;

class Application extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'applications';

    protected $fillable = [
        'acknowledgement_number',
        'customer_id',
        'status',
        'preferred_account_type',
        'submitted_at',
        'approved_at',
        'rejected_at',
        'rejection_reason',
        'metadata',
    ];

    protected $casts = [
        'status' => ApplicationStatus::class,
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(ApplicationStep::class)->orderBy('step_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ApplicationReview::class)->latest();
    }

    public function corrections(): HasMany
    {
        return $this->hasMany(ApplicationCorrection::class)->latest();
    }

    public function documents(): HasMany
    {
        return $this->hasMany(KycDocument::class);
    }

    public function personalInfo(): HasOne
    {
        return $this->hasOne(PersonalInformation::class);
    }

    public function contactInfo(): HasOne
    {
        return $this->hasOne(ContactInformation::class);
    }

    public function addressInfo(): HasOne
    {
        return $this->hasOne(AddressInformation::class);
    }

    public function kycInfo(): HasOne
    {
        return $this->hasOne(KycInformation::class);
    }

    public function getCurrentStep(): ?ApplicationStep
    {
        return $this->steps()
            ->whereIn('status', [ApplicationStepStatus::PENDING, ApplicationStepStatus::IN_REVIEW, ApplicationStepStatus::CORRECTION_REQUIRED])
            ->orderBy('step_order')
            ->first();
    }

    public function getProgressPercentage(): int
    {
        $total = $this->steps()->count();
        if ($total === 0) return 0;

        $completed = $this->steps()->where('status', ApplicationStepStatus::VERIFIED)->count();
        $correctionSubmitted = $this->steps()->where('status', ApplicationStepStatus::CORRECTION_SUBMITTED)->count();

        return (int) round((($completed + $correctionSubmitted) / $total) * 100);
    }

    public function isFullyApproved(): bool
    {
        return $this->steps()->where('status', '!=', ApplicationStepStatus::VERIFIED)->count() === 0
            && $this->status === ApplicationStatus::APPROVED;
    }
}