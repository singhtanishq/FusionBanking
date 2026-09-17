<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\TransferStatus;

class Transfer extends Model
{
    use HasFactory;

    protected $table = 'transfers';

    protected $fillable = [
        'transfer_id',
        'reference_number',
        'sender_account_id',
        'receiver_account_id',
        'sender_customer_id',
        'receiver_customer_id',
        'amount',
        'fee',
        'total_debit',
        'transfer_type',
        'remark',
        'status',
        'verification_token_id',
        'verified_at',
        'processed_at',
        'failed_at',
        'failure_reason',
        'idempotency_key',
        'metadata',
    ];

    protected $casts = [
        'status' => TransferStatus::class,
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'total_debit' => 'decimal:2',
        'verified_at' => 'datetime',
        'processed_at' => 'datetime',
        'failed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function senderAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'sender_account_id');
    }

    public function receiverAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'receiver_account_id');
    }

    public function senderCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'sender_customer_id');
    }

    public function receiverCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'receiver_customer_id');
    }

    public function verificationToken(): BelongsTo
    {
        return $this->belongsTo(VerificationToken::class, 'verification_token_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function getFormattedAmount(): string
    {
        return '₹' . number_format($this->amount, 2);
    }
}