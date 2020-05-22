<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\AccountStatus;

class BankAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'bank_accounts';

    protected $fillable = [
        'customer_id',
        'account_number',
        'ifsc_code',
        'account_type',
        'status',
        'balance',
        'available_balance',
        'opening_date',
        'closing_date',
        'is_primary',
        'frozen_at',
        'frozen_by',
        'frozen_reason',
        'closed_at',
        'closed_by',
        'closed_reason',
        'metadata',
    ];

    protected $casts = [
        'status' => AccountStatus::class,
        'balance' => 'decimal:2',
        'available_balance' => 'decimal:2',
        'opening_date' => 'date',
        'closing_date' => 'date',
        'is_primary' => 'boolean',
        'frozen_at' => 'datetime',
        'closed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function sentTransfers(): HasMany
    {
        return $this->hasMany(Transfer::class, 'sender_account_id');
    }

    public function receivedTransfers(): HasMany
    {
        return $this->hasMany(Transfer::class, 'receiver_account_id');
    }

    public function frozenBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'frozen_by');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'closed_by');
    }

    public function getMaskedAccountNumber(): string
    {
        return 'XXXXXX' . substr($this->account_number, -4);
    }

    public function canTransact(): bool
    {
        return $this->status === AccountStatus::ACTIVE;
    }

    public function isFrozen(): bool
    {
        return $this->status === AccountStatus::FROZEN;
    }

    public function isClosed(): bool
    {
        return $this->status === AccountStatus::CLOSED;
    }

    public function refreshBalance(): void
    {
        $this->balance = $this->transactions()
            ->where('status', 'completed')
            ->sum('amount');
        
        $this->available_balance = $this->balance;
        $this->save();
    }
}