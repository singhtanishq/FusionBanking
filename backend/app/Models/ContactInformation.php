<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactInformation extends Model
{
    use HasFactory;

    protected $table = 'contact_information';

    protected $fillable = [
        'application_id',
        'mobile_number',
        'email',
        'alternate_mobile',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}