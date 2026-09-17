<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\FDStatus;

class FixedDeposit extends Model
{
    use HasFactory;

    protected $table = 'fixed_deposits';

    protected $fillable = [
        'fd_number',
        'customer_id',
        'account_id',
        'fd_product_id',
        'status',
        'principal_amount',
        'interest_rate',
        'tenure_months',
        'maturity_amount',
        'maturity_date',
        'opened_at',
        'matured_at',
        'closed_at',
        'closed_by',
        'auto_renew',
        'renewal_count',
        'metadata',
    ];

    protected $casts = [
        'status' => FDStatus::class,
        'principal_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'maturity_amount' => 'decimal:2',
        'maturity_date' => 'date',
        'opened_at' => 'datetime',
        'matured_at' => 'datetime',
        'closed_at' => 'datetime',
        'auto_renew' => 'boolean',
        'metadata' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(FDProduct::class, 'fd_product_id');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'closed_by');
    }

    public function isMatured(): bool
    {
        return $this->status === FDStatus::MATURED || 
            ($this->maturity_date && $this->maturity_date->isPast());
    }
}