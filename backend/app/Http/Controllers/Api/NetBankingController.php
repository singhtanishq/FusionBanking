<?php

namespace App\Http\Controllers\Api;

use App\Enums\VerificationPurpose;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\VerificationTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use App\Notifications\NetBankingActivationNotification;

class NetBankingController extends Controller
{
    public function activate(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|string',
        ]);

        $key = 'netbanking_activation:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'success' => false,
                'message' => 'Too many activation requests. Please try again later.',
            ], 429);
        }

        $customer = Customer::where('customer_id', $request->customer_id)->first();

        if (!$customer) {
            RateLimiter::hit($key, 300);

            return response()->json([
                'success' => false,
                'message' => 'Invalid customer ID.',
            ], 404);
        }

        if (!$customer->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is deactivated. Please contact support.',
            ], 403);
        }

        if ($customer->netbanking_activated_at) {
            return response()->json([
                'success' => false,
                'message' => 'NetBanking is already activated for this account.',
            ], 409);
        }

        $tokenService = new VerificationTokenService();

        $result = $tokenService->generateToken(
            $customer,
            VerificationPurpose::NETBANKING_ACTIVATION,
            Customer::class,
            $customer->id
        );

        $customer->notify(
            new NetBankingActivationNotification(
                $customer,
                $result['token']
            )
        );

        RateLimiter::clear($key);

        \App\Models\SecurityEvent::log(
            'netbanking_activation_requested',
            'NetBanking activation token generated',
            ['ip' => $request->ip()],
            'info',
            $customer->id
        );

        return response()->json([
            'success' => true,
            'message' => 'NetBanking activation token sent to your registered email.',
            'data' => [
                'customer_id' => $customer->customer_id,
                'expires_at' => $result['expires_at'],
            ],
        ]);
    }

    public function verifyActivation(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|string',
            'token' => 'required|string|size:16',
            'password' => 'required|string|min:10|confirmed',
        ]);

        $customer = Customer::where('customer_id', $request->customer_id)->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid activation details.',
            ], 401);
        }

        if (!$customer->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is deactivated. Please contact support.',
            ], 403);
        }

        if ($customer->netbanking_activated_at) {
            return response()->json([
                'success' => false,
                'message' => 'NetBanking is already activated for this account.',
            ], 409);
        }

        try {
            $tokenService = new VerificationTokenService();

            $verificationToken = $tokenService->verifyToken(
                $request->token,
                VerificationPurpose::NETBANKING_ACTIVATION,
                Customer::class,
                $customer->id,
                $customer
            );

            DB::transaction(function () use ($customer, $request, $verificationToken) {
                /*
                 * Customer::$casts defines password as 'hashed',
                 * so we intentionally pass the plain password here.
                 */
                $customer->update([
                    'password' => $request->password,
                    'netbanking_activated_at' => now(),
                    'password_changed_at' => now(),
                ]);

                \App\Models\SecurityEvent::log(
                    'netbanking_activated',
                    'NetBanking activation completed successfully',
                    [],
                    'info',
                    $customer->id
                );
            });

            return response()->json([
                'success' => true,
                'message' => 'NetBanking activated successfully. You can now login.',
                'data' => [
                    'customer_id' => $customer->customer_id,
                ],
            ]);
        } catch (\Exception $e) {
            \App\Models\SecurityEvent::log(
                'netbanking_activation_failed',
                'NetBanking activation verification failed',
                ['error' => $e->getMessage()],
                'warning',
                $customer->id
            );

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
        }
    }
}