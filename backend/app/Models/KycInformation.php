<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycInformation extends Model
{
    use HasFactory;

    protected $table = 'kyc_information';

    protected $fillable = [
        'application_id',
        'pan_number',
        'aadhaar_number',
        'kyc_type',
        'identity_verification_metadata',
        'metadata',
    ];

    protected $casts = [
        'identity_verification_metadata' => 'array',
        'metadata' => 'array',
    ];

    protected $hidden = [
        'pan_number',
        'aadhaar_number',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function getMaskedPan(): string
    {
        if (!$this->pan_number) return '';
        return substr($this->pan_number, 0, 5) . '****' . substr($this->pan_number, -1);
    }

    public function getMaskedAadhaar(): string
    {
        if (!$this->aadhaar_number) return '';
        $aadhaar = str_replace(' ', '', $this->aadhaar_number);
        return 'XXXX XXXX ' . substr($aadhaar, -4);
    }
}