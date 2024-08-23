<?php

namespace Database\Factories;

use App\Models\BankAccount;
use App\Enums\AccountStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class BankAccountFactory extends Factory
{
    protected $model = BankAccount::class;

    public function definition(): array
    {
        $accountTypes = ['savings', 'current'];
        
        return [
            'account_number' => '50' . $this->faker->unique()->numberBetween(1000000000, 9999999999),
            'ifsc_code' => 'FUSB0001001',
            'account_type' => $accountTypes[$this->faker->numberBetween(0, 1)],
            'status' => AccountStatus::ACTIVE,
            'balance' => $this->faker->randomFloat(2, 0, 1000000),
            'available_balance' => $this->faker->randomFloat(2, 0, 1000000),
            'opening_date' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'is_primary' => true,
        ];
    }
}