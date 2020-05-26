<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoanProduct extends Model
{
    use HasFactory;

    protected $table = 'loan_products';

    protected $fillable = [
        'name',
        'code',
        'description',
        'min_amount',
        'max_amount',
        'min_tenure_months',
        'max_tenure_months',
        'interest_rate',
        'processing_fee_percent',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'processing_fee_percent' => 'decimal:2',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }
}