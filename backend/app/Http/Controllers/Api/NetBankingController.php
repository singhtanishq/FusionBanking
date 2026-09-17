<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\BankAccount;
use App\Services\VerificationTokenService;
use App\Services\AccountService;
use App\Enums\VerificationPurpose;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class NetBankingController extends Controller
{
    protected VerificationTokenService $tokenService;
    protected AccountService $accountService;

    public function __construct(VerificationTokenService $tokenService, AccountService $accountService)
    {
        $this->tokenService = $tokenService;
        $this->accountService = $accountService;
    }

    public function activate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|string|exists:customers,customer_id',
            'account_number' => 'required|string|exists:bank_accounts,account_number',
            'mobile' => 'required|string|regex:/^[6-9]\d{9}$/',
            'date_of_birth' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = Customer::where('customer_id', $request->customer_id)
            ->where('mobile', $request->mobile)
            ->where('date_of_birth', $request->date_of_birth)
            ->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid details provided',
            ], 422);
        }

        $account = BankAccount::where('account_number', $request->account_number)
            ->where('customer_id', $customer->id)
            ->where('status', \App\Enums\AccountStatus::ACTIVE)
            ->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Account not found or not active',
            ], 422);
        }

        // Generate and send verification token
        $tokenData = $this->tokenService->generateToken(
            $customer,
            VerificationPurpose::NETBANKING_ACTIVATION,
            Customer::class,
            $customer->id
        );

        $customer->notify(new \App\Notifications\NetBankingActivationNotification($customer, $tokenData['token']));

        return response()->json([
            'success' => true,
            'message' => 'Verification token sent to your registered email',
            'data' => [
                'requires_token' => true,
            ],
        ]);
    }

    public function verifyActivation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|string',
            'token' => 'required|string|size:16',
            'password' => 'required|string|min:10|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = Customer::where('customer_id', $request->customer_id)->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid customer ID',
            ], 422);
        }

        try {
            $this->tokenService->verifyToken(
                $request->token,
                VerificationPurpose::NETBANKING_ACTIVATION,
                Customer::class,
                $customer->id,
                $customer
            );

            $customer->update([
                'password' => Hash::make($request->password),
                'password_changed_at' => now(),
                'netbanking_activated_at' => now(),
            ]);

            // Revoke all existing tokens
            $customer->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'NetBanking activated successfully. You can now login.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
