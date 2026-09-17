<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FDProduct extends Model
{
    use HasFactory;

    protected $table = 'fd_products';

    protected $fillable = [
        'name',
        'code',
        'description',
        'min_amount',
        'max_amount',
        'min_tenure_months',
        'max_tenure_months',
        'interest_rate',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function fixedDeposits(): HasMany
    {
        return $this->hasMany(FixedDeposit::class);
    }
}