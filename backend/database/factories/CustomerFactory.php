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
        static $emailCounter = 0;
        
        // Generate a unique name using firstName and lastName
        $firstName = $this->faker->firstName();
        $lastName = $this->faker->lastName();
        
        // Use a combination of counter, random string, and microtime to ensure uniqueness
        $uniqueSuffix = ++$emailCounter . '_' . uniqid('', true);
        
        return [
            'customer_id' => 'CUS' . $this->faker->unique()->numberBetween(1000000, 9999999),
            'email' => 'user_' . $uniqueSuffix . '@example.com',
            'mobile' => '9' . $this->faker->unique()->numberBetween(100000000, 999999999),
            'alternate_mobile' => '8' . $this->faker->numberBetween(100000000, 999999999),
            'full_name' => $this->faker->name(),
            'father_name' => $this->faker->name(),
            'mother_name' => $this->faker->name(),
            'date_of_birth' => $this->faker->dateTimeBetween('-60 years', '-18 years'),
            'gender' => $this->faker->randomElement(['male', 'female', 'other']),
            'marital_status' => $this->faker->randomElement(['single', 'married', 'divorced', 'widowed']),
            'nationality' => 'Indian',
            'occupation' => $this->faker->randomElement(['Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Accountant', 'Lawyer', 'Engineer', 'Manager']),
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