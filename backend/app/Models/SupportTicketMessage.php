<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportTicketMessage extends Model
{
    use HasFactory;

    protected $table = 'support_ticket_messages';

    protected $fillable = [
        'ticket_id',
        'sender_type',
        'sender_id',
        'message',
        'is_internal',
        'metadata',
    ];

    protected $casts = [
        'is_internal' => 'boolean',
        'metadata' => 'array',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(SupportTicket::class);
    }

    public function sender(): \Illuminate\Database\Eloquent\Relations\MorphTo
    {
        return $this->morphTo('sender', 'sender_type', 'sender_id');
    }
}