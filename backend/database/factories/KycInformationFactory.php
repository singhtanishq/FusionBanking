<?php

namespace Database\Factories;

use App\Models\KycInformation;
use Illuminate\Database\Eloquent\Factories\Factory;

class KycInformationFactory extends Factory
{
    protected $model = KycInformation::class;

    public function definition(): array
    {
        return [
            'pan_number' => strtoupper($this->faker->bothify('?????####?')),
            'aadhaar_number' => $this->faker->numberBetween(100000000000, 999999999999),
            'kyc_type' => 'full',
        ];
    }
}