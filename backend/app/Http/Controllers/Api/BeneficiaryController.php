<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Beneficiary;
use App\Models\Customer;
use App\Services\VerificationTokenService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Enums\VerificationPurpose;

class BeneficiaryController extends Controller
{
    protected VerificationTokenService $tokenService;

    public function __construct(VerificationTokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $customer = $request->user();
        $beneficiaries = Beneficiary::where('customer_id', $customer->id)
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $beneficiaries->map(function ($beneficiary) {
                return [
                    'id' => $beneficiary->id,
                    'name' => $beneficiary->name,
                    'account_number' => $beneficiary->getMaskedAccountNumber(),
                    'ifsc_code' => $beneficiary->ifsc_code,
                    'nickname' => $beneficiary->nickname,
                    'is_verified' => $beneficiary->is_verified,
                    'verified_at' => $beneficiary->verified_at?->toISOString(),
                    'cooling_period_ends_at' => $beneficiary->cooling_period_ends_at?->toISOString(),
                    'is_in_cooling_period' => $beneficiary->isInCoolingPeriod(),
                ];
            }),
            'pagination' => [
                'current_page' => $beneficiaries->currentPage(),
                'last_page' => $beneficiaries->lastPage(),
                'total' => $beneficiaries->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $customer = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:100',
            'account_number' => 'required|string|min:12|max:20',
            'ifsc_code' => 'required|string|min:8|max:15',
            'nickname' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validate recipient exists and is active
        $receiverAccount = \App\Models\BankAccount::where('account_number', $request->account_number)
            ->where('ifsc_code', strtoupper($request->ifsc_code))
            ->where('status', \App\Enums\AccountStatus::ACTIVE)
            ->first();

        if (!$receiverAccount) {
            return response()->json([
                'success' => false,
                'message' => 'Beneficiary account not found or not active',
            ], 422);
        }

        if ($receiverAccount->customer_id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add yourself as a beneficiary',
            ], 422);
        }

        // Check if already exists
        $existing = Beneficiary::where('customer_id', $request->user()->id)
            ->where('account_number', $request->account_number)
            ->where('ifsc_code', strtoupper($request->ifsc_code))
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Beneficiary already exists',
            ], 422);
        }

        $beneficiary = Beneficiary::create([
            'customer_id' => $request->user()->id,
            'name' => $receiverAccount->customer->full_name,
            'account_number' => $request->account_number,
            'ifsc_code' => strtoupper($request->ifsc_code),
            'nickname' => $request->nickname ?? $receiverAccount->customer->full_name,
            'is_verified' => false,
        ]);

        // Create verification token for beneficiary
        $tokenData = $this->tokenService->generateToken(
            $request->user(),
            \App\Enums\VerificationPurpose::BENEFICIARY_VERIFICATION,
            Beneficiary::class,
            $beneficiary->id
        );

        $beneficiary->update([
            'verification_token_id' => \App\Models\VerificationToken::where('token_hash', \App\Models\VerificationToken::hashToken($tokenData['token']))->first()?->id,
            'cooling_period_ends_at' => now()->addHours(config('system_settings.beneficiary_cooling_hours', 24)),
        ]);

        // Send verification email
        $request->user()->notify(new \App\Notifications\BeneficiaryVerificationNotification($beneficiary, $tokenData['token']));

        return response()->json([
            'success' => true,
            'message' => 'Beneficiary added. Please verify via the token sent to your email.',
            'data' => [
                'id' => $beneficiary->id,
                'name' => $beneficiary->name,
                'account_number' => $beneficiary->getMaskedAccountNumber(),
                'ifsc_code' => $beneficiary->ifsc_code,
                'is_verified' => false,
                'cooling_period_ends_at' => $beneficiary->cooling_period_ends_at?->toISOString(),
            ],
        ], 201);
    }

    public function show(Request $request, Beneficiary $beneficiary): JsonResponse
    {
        if ($beneficiary->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Beneficiary not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $beneficiary->id,
                'name' => $beneficiary->name,
                'account_number' => $beneficiary->account_number,
                'ifsc_code' => $beneficiary->ifsc_code,
                'nickname' => $beneficiary->nickname,
                'is_verified' => $beneficiary->is_verified,
                'verified_at' => $beneficiary->verified_at?->toISOString(),
                'cooling_period_ends_at' => $beneficiary->cooling_period_ends_at?->toISOString(),
                'is_in_cooling_period' => $beneficiary->isInCoolingPeriod(),
            ],
        ]);
    }

    public function update(Request $request, Beneficiary $beneficiary): JsonResponse
    {
        if ($beneficiary->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Beneficiary not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nickname' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $beneficiary->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Beneficiary updated',
        ]);
    }

    public function destroy(Request $request, Beneficiary $beneficiary): JsonResponse
    {
        if ($beneficiary->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Beneficiary not found',
            ], 404);
        }

        $beneficiary->delete();

        return response()->json([
            'success' => true,
            'message' => 'Beneficiary removed',
        ]);
    }

    public function verify(Request $request, Beneficiary $beneficiary): JsonResponse
    {
        if ($beneficiary->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Beneficiary not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'otp' => 'required|string|size:16',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification token',
            ], 422);
        }

        try {
            $this->tokenService->verifyToken(
                $request->otp,
                VerificationPurpose::BENEFICIARY_VERIFICATION,
                Beneficiary::class,
                $beneficiary->id,
                $request->user()
            );

            $beneficiary->update([
                'is_verified' => true,
                'verified_at' => now(),
                'cooling_period_ends_at' => now()->addHours(config('system_settings.beneficiary_cooling_hours', 24)),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Beneficiary verified successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}