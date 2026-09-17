<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\LoanStatus;

class Loan extends Model
{
    use HasFactory;

    protected $table = 'loans';

    protected $fillable = [
        'loan_number',
        'customer_id',
        'account_id',
        'loan_product_id',
        'status',
        'principal_amount',
        'approved_amount',
        'interest_rate',
        'tenure_months',
        'emi',
        'total_interest',
        'total_repayment',
        'disbursed_at',
        'first_emi_date',
        'maturity_date',
        'closed_at',
        'purpose',
        'employment_type',
        'employer_name',
        'employment_duration_months',
        'monthly_salary',
        'existing_obligations',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
        'metadata',
    ];

    protected $casts = [
        'status' => LoanStatus::class,
        'principal_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'emi' => 'decimal:2',
        'total_interest' => 'decimal:2',
        'total_repayment' => 'decimal:2',
        'monthly_salary' => 'decimal:2',
        'existing_obligations' => 'decimal:2',
        'disbursed_at' => 'datetime',
        'first_emi_date' => 'date',
        'maturity_date' => 'date',
        'closed_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
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
        return $this->belongsTo(LoanProduct::class, 'loan_product_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'rejected_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(LoanPayment::class);
    }

    public function getRepaymentRatio(): float
    {
        if ($this->monthly_salary <= 0) return 0;
        return ($this->emi + $this->existing_obligations) / $this->monthly_salary * 100;
    }
}