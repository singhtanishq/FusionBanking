<?php

use App\Models\Application;
use App\Models\ApplicationStep;
use App\Enums\ApplicationStatus;
use App\Enums\ApplicationStepStatus;
use App\Models\VerificationToken;
use App\Enums\VerificationPurpose;
use Illuminate\Support\Str;

uses(\Tests\TestCase::class)->group('feature');

function createTrackedApplication(array $stepOverrides = []): Application
{
    $application = Application::create([
        'acknowledgement_number' => 'FBK-2026-' . strtoupper(Str::random(8)),
        'status' => ApplicationStatus::UNDER_REVIEW,
        'preferred_account_type' => 'savings',
        'submitted_at' => now(),
    ]);

    $stepKeys = ['personal_info', 'contact_info', 'kyc_info', 'address_info', 'documents', 'review'];
    foreach ($stepKeys as $order => $key) {
        $application->steps()->create([
            'step_key' => $key,
            'step_name' => ucwords(str_replace('_', ' ', $key)),
            'step_order' => $order + 1,
            'status' => $stepOverrides[$key] ?? ApplicationStepStatus::VERIFIED,
        ]);
    }

    return $application->fresh();
}

test('public track endpoint returns application status by acknowledgement number', function () {
    $application = createTrackedApplication();

    $response = $this->getJson("/api/v1/track/{$application->acknowledgement_number}");

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.acknowledgement_number', $application->acknowledgement_number)
        ->assertJsonPath('data.status', 'under_review')
        ->assertJsonCount(6, 'data.steps');
});

test('track endpoint does not leak personal information', function () {
    $application = createTrackedApplication();

    $response = $this->getJson("/api/v1/track/{$application->acknowledgement_number}");

    $json = $response->json();
    $encoded = json_encode($json);

    // Public tracking must expose status data only — no identity/KYC fields.
    expect($encoded)->not->toContain('personalInformation');
    expect($json['data'])->not->toHaveKey('customer_id');
    expect($json['data'])->not->toHaveKey('kyc_info');
});

test('track endpoint returns 404 for unknown acknowledgement number', function () {
    $this->getJson('/api/v1/track/FBK-2026-UNKNOWNXX')
        ->assertNotFound()
        ->assertJsonPath('success', false);
});

test('correction token verification rejects invalid tokens', function () {
    $application = createTrackedApplication([
        'kyc_info' => ApplicationStepStatus::CORRECTION_REQUIRED,
    ]);

    $this->postJson("/api/v1/track/{$application->acknowledgement_number}/verify", [
        'token' => 'definitely-not-valid-token',
        'step_key' => 'kyc_info',
    ])->assertStatus(422)
        ->assertJsonPath('success', false);
});

test('correction token verification validates input', function () {
    $application = createTrackedApplication();

    $this->postJson("/api/v1/track/{$application->acknowledgement_number}/verify", [])
        ->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonStructure(['errors']);
});

test('correction submission requires a valid token', function () {
    $application = createTrackedApplication([
        'kyc_info' => ApplicationStepStatus::CORRECTION_REQUIRED,
    ]);

    $this->postJson("/api/v1/track/{$application->acknowledgement_number}/correct/kyc_info", [
        'token' => 'bogus-token-value',
        'data' => ['pan_number' => 'ABCDE1234F'],
    ])->assertStatus(422)
        ->assertJsonPath('success', false);

    // Step must be untouched after failed correction
    expect($application->fresh()->steps()->where('step_key', 'kyc_info')->first()->status)
        ->toBe(ApplicationStepStatus::CORRECTION_REQUIRED);
});

test('correction submission succeeds with a valid token', function () {
    $application = createTrackedApplication([
        'kyc_info' => ApplicationStepStatus::CORRECTION_REQUIRED,
    ]);

    $plainToken = VerificationToken::generateToken(16);
    VerificationToken::create([
        'token_hash' => VerificationToken::hashToken($plainToken),
        'purpose' => VerificationPurpose::APPLICATION_CORRECTION,
        'resource_type' => Application::class,
        'resource_id' => $application->id,
        'expires_at' => now()->addMinutes(10),
        'max_attempts' => 3,
    ]);

    $this->postJson("/api/v1/track/{$application->acknowledgement_number}/correct/kyc_info", [
        'token' => $plainToken,
        'data' => ['pan_number' => 'ABCDE9999F'],
    ])->assertCreated()
        ->assertJsonPath('success', true);

    // Token must be consumed and the step updated
    expect(VerificationToken::where('resource_id', $application->id)
        ->where('purpose', VerificationPurpose::APPLICATION_CORRECTION)
        ->where('is_used', true)->exists())->toBeTrue();
    expect($application->fresh()->steps()->where('step_key', 'kyc_info')->first()->status)
        ->toBe(ApplicationStepStatus::CORRECTION_SUBMITTED);
});

test('internal server errors do not leak exception details', function () {
    config(['app.debug' => false]);

    // Force an unhandled exception with sensitive-looking details
    $this->mock(\App\Services\ApplicationService::class, function ($mock) {
        $mock->shouldReceive('createDraftApplication')
            ->andThrow(new \RuntimeException('SQLSTATE[HY000] connection refused at /var/lib/secret/db.sock'));
    });

    $response = $this->postJson('/api/v1/applications');

    expect($response->status())->toBe(500);
    $message = $response->json('message');
    expect($message)->toBe('An unexpected error occurred. Please try again later.');
    expect($message)->not->toContain('SQLSTATE');
    expect($message)->not->toContain('secret');
});

test('http exceptions still return their user-facing message', function () {
    $this->getJson('/api/v1/track/DOES-NOT-EXIST')
        ->assertStatus(404)
        ->assertJsonPath('success', false);
});
