<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\ApplicationStepStatus;

class ApplicationReview extends Model
{
    use HasFactory;

    protected $table = 'application_reviews';

    protected $fillable = [
        'application_id',
        'application_step_id',
        'admin_id',
        'action',
        'previous_status',
        'new_status',
        'reason',
        'details',
        'metadata',
    ];

    protected $casts = [
        'previous_status' => ApplicationStepStatus::class,
        'new_status' => ApplicationStepStatus::class,
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

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }
}