<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AddressInformation extends Model
{
    use HasFactory;

    protected $table = 'address_information';

    protected $fillable = [
        'application_id',
        'residential_address_line_1',
        'residential_address_line_2',
        'residential_city',
        'residential_state',
        'residential_postal_code',
        'residential_country',
        'residential_landmark',
        'permanent_address_line_1',
        'permanent_address_line_2',
        'permanent_city',
        'permanent_state',
        'permanent_postal_code',
        'permanent_country',
        'permanent_landmark',
        'same_as_residential',
        'metadata',
    ];

    protected $casts = [
        'same_as_residential' => 'boolean',
        'metadata' => 'array',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}