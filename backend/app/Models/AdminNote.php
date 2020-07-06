<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AdminNote extends Model
{
    use HasFactory;

    protected $table = 'admin_notes';

    protected $fillable = [
        'admin_id',
        'notable_type',
        'notable_id',
        'note',
        'is_internal',
        'metadata',
    ];

    protected $casts = [
        'is_internal' => 'boolean',
        'metadata' => 'array',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    public function notable(): MorphTo
    {
        return $this->morphTo('notable', 'notable_type', 'notable_id');
    }
}