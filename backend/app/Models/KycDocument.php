<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycDocument extends Model
{
    use HasFactory;

    protected $table = 'kyc_documents';

    protected $fillable = [
        'application_id',
        'application_step_id',
        'application_correction_id',
        'document_type',
        'document_category',
        'original_filename',
        'stored_filename',
        'mime_type',
        'file_size',
        'file_path',
        'is_verified',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'metadata',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
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

    public function correction(): BelongsTo
    {
        return $this->belongsTo(ApplicationCorrection::class, 'application_correction_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'verified_by');
    }

    public function getDownloadUrl(): string
    {
        return route('admin.documents.download', $this->id);
    }
}