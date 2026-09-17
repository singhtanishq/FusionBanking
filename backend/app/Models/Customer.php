<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Customer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, LogsActivity;

    protected $table = 'customers';

    protected $fillable = [
        'customer_id',
        'application_id',
        'email',
        'password',
        'mobile',
        'alternate_mobile',
        'full_name',
        'father_name',
        'mother_name',
        'date_of_birth',
        'gender',
        'marital_status',
        'nationality',
        'occupation',
        'annual_income',
        'pan_number',
        'aadhaar_number',
        'kyc_type',
        'kyc_verified_at',
        'netbanking_activated_at',
        'last_login_at',
        'last_login_ip',
        'failed_login_attempts',
        'locked_until',
        'password_changed_at',
        'email_verified_at',
        'mobile_verified_at',
        'is_active',
        'metadata',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'pan_number',
        'aadhaar_number',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'mobile_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_of_birth' => 'date',
        'kyc_verified_at' => 'datetime',
        'netbanking_activated_at' => 'datetime',
        'last_login_at' => 'datetime',
        'locked_until' => 'datetime',
        'password_changed_at' => 'datetime',
        'annual_income' => 'decimal:2',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['customer_id', 'email', 'mobile', 'full_name', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function application(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function accounts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BankAccount::class);
    }

    public function primaryAccount(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(BankAccount::class)->where('is_primary', true);
    }

    public function addresses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function transactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function beneficiaries(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Beneficiary::class);
    }

    public function loans(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function fixedDeposits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(FixedDeposit::class);
    }

    public function verificationTokens(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(VerificationToken::class);
    }

    public function securityEvents(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SecurityEvent::class);
    }

    public function sessions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CustomerSession::class);
    }

    public function getMaskedPan(): string
    {
        if (!$this->pan_number) return '';
        $pan = $this->pan_number;
        return substr($pan, 0, 5) . '****' . substr($pan, -1);
    }

    public function getMaskedAadhaar(): string
    {
        if (!$this->aadhaar_number) return '';
        $aadhaar = str_replace(' ', '', $this->aadhaar_number);
        return 'XXXX XXXX ' . substr($aadhaar, -4);
    }

    public function getFullName(): string
    {
        return $this->full_name;
    }
}