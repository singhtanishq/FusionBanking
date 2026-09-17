<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\TransactionType;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';

    protected $fillable = [
        'transaction_id',
        'reference_number',
        'account_id',
        'related_account_id',
        'transfer_id',
        'type',
        'direction',
        'amount',
        'opening_balance',
        'closing_balance',
        'currency',
        'status',
        'description',
        'completed_at',
        'metadata',
    ];

    protected $casts = [
        'type' => TransactionType::class,
        'amount' => 'decimal:2',
        'opening_balance' => 'decimal:2',
        'closing_balance' => 'decimal:2',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'account_id');
    }

    public function relatedAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'related_account_id');
    }

    public function transfer(): BelongsTo
    {
        return $this->belongsTo(Transfer::class);
    }

    public function getFormattedAmount(): string
    {
        return '₹' . number_format($this->amount, 2);
    }

    public function getDirectionLabel(): string
    {
        return $this->direction === 'credit' ? '+' : '-';
    }
}