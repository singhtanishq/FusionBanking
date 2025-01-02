<?php

namespace Database\Factories;

use App\Models\KycInformation;
use Illuminate\Database\Eloquent\Factories\Factory;

class KycInformationFactory extends Factory
{
    protected $model = KycInformation::class;

    public function definition(): array
    {
        // Generate PAN using bothify format
        $pan = strtoupper($this->faker->format('bothify', '?????####?'));
        
        return [
            'pan_number' => $pan,
            'aadhaar_number' => $this->faker->numberBetween(100000000000, 999999999999),
            'kyc_type' => 'full',
        ];
    }
}