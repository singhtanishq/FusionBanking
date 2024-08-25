<?php

namespace Database\Factories;

use App\Models\Beneficiary;
use Illuminate\Database\Eloquent\Factories\Factory;

class BeneficiaryFactory extends Factory
{
    protected $model = Beneficiary::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->firstName() . ' ' . $this->faker->lastName(),
            'account_number' => '50' . $this->faker->unique()->numberBetween(1000000000, 9999999999),
            'ifsc_code' => 'FUSB0001001',
            'nickname' => $this->faker->firstName() . ' ' . $this->faker->lastName(),
            'is_verified' => $this->faker->boolean(),
        ];
    }
}