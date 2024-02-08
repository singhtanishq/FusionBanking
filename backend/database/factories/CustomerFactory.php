<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'customer_id' => 'CUS' . $this->faker->unique()->numberBetween(1000000, 9999999),
            'email' => $this->faker->unique()->email(),
            'mobile' => '9' . $this->faker->unique()->numberBetween(100000000, 999999999),
            'alternate_mobile' => '8' . $this->faker->numberBetween(100000000, 999999999),
            'full_name' => $this->faker->name(),
            'father_name' => $this->faker->name('male'),
            'mother_name' => $this->faker->name('female'),
            'date_of_birth' => $this->faker->dateTimeBetween('-60 years', '-18 years'),
            'gender' => $this->faker->randomElement(['male', 'female', 'other']),
            'marital_status' => $this->faker->randomElement(['single', 'married', 'divorced', 'widowed']),
            'nationality' => 'Indian',
            'occupation' => $this->faker->jobTitle(),
            'annual_income' => $this->faker->numberBetween(300000, 5000000),
            'pan_number' => strtoupper($this->faker->bothify('?????####?')),
            'aadhaar_number' => $this->faker->numberBetween(100000000000, 999999999999),
            'kyc_type' => 'full',
            'kyc_verified_at' => now(),
            'password' => bcrypt('password123'),
            'is_active' => true,
            'email_verified_at' => now(),
        ];
    }
}