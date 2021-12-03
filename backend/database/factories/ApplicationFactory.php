<?php

namespace Database\Factories;

use App\Models\Application;
use App\Enums\ApplicationStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        return [
            'acknowledgement_number' => 'FBK-' . now()->year . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'status' => $this->faker->randomElement(array_column(ApplicationStatus::cases(), 'value')),
            'preferred_account_type' => $this->faker->randomElement(['savings', 'current']),
            'submitted_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}