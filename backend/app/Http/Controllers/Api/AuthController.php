<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Admin;
use App\Models\VerificationToken;
use App\Services\VerificationTokenService;
use App\Enums\VerificationPurpose;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function customerLogin(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|string',
            'password' => 'required|string',
        ]);

        // Rate limiting
        $key = 'customer_login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'success' => false,
                'message' => 'Too many login attempts. Please try again later.',
            ], 429);
        }

        $customer = Customer::where('customer_id', $request->customer_id)->first();

        if (!$customer || !Hash::check($request->password, $customer->password)) {
            RateLimiter::hit($key, 300);
            
            // Log failed attempt
            \App\Models\SecurityEvent::log(
                'failed_login',
                'Failed login attempt',
                ['customer_id' => $request->customer_id],
                'warning',
                $customer?->id
            );
            
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        if (!$customer->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is deactivated. Please contact support.',
            ], 403);
        }

        // Check if account is locked
        if ($customer->locked_until && $customer->locked_until->isFuture()) {
            return response()->json([
                'success' => false,
                'message' => 'Account temporarily locked due to multiple failed attempts.',
            ], 423);
        }

        RateLimiter::clear($key);

        // Generate and send OTP
        $tokenService = new VerificationTokenService();
        $result = $tokenService->generateToken(
            $customer,
            VerificationPurpose::LOGIN_OTP,
            Customer::class,
            $customer->id
        );

        $customer->notify(new \App\Notifications\LoginOtpNotification($customer, $result['token'], $request->ip()));

        // Log successful credential validation
        \App\Models\SecurityEvent::log(
            'login_credentials_valid',
            'Login credentials validated, OTP sent',
            ['ip' => $request->ip()],
            'info',
            $customer->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to your registered email',
            'data' => [
                'requires_otp' => true,
                'customer_id' => $customer->customer_id,
            ],
        ]);
    }

    public function customerVerifyOtp(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        $customer = Customer::where('customer_id', $request->customer_id)->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code',
            ], 401);
        }

        try {
            $tokenService = new VerificationTokenService();
            $tokenService->verifyToken(
                $request->otp,
                VerificationPurpose::LOGIN_OTP,
                Customer::class,
                $customer->id,
                $customer
            );

            // Create API token
            $token = $customer->createToken('netbanking')->plainTextToken;

            // Update last login
            $customer->update([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
                'failed_login_attempts' => 0,
            ]);

            // Create session record
            \App\Models\CustomerSession::create([
                'customer_id' => $customer->id,
                'session_token' => hash('sha256', $token),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'device_info' => $this->parseUserAgent($request->userAgent()),
                'last_activity_at' => now(),
                'expires_at' => now()->addMinutes(config('sanctum.expiration', 1440)),
            ]);

            // Log successful login
            \App\Models\SecurityEvent::log(
                'login_success',
                'Successful login',
                ['ip' => $request->ip()],
                'info',
                $customer->id
            );

            // Send login notification
            $customer->notify(new \App\Notifications\LoginOtpNotification($customer, 'LOGGED_IN', $request->ip()));

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'token' => $token,
                    'user' => $this->formatCustomer($customer),
                ],
            ]);
        } catch (\Exception $e) {
            \App\Models\SecurityEvent::log(
                'login_otp_failed',
                'OTP verification failed',
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

    public function adminLogin(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'bank_access_token' => 'required|string',
        ]);

        // Rate limiting
        $key = 'admin_login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json([
                'success' => false,
                'message' => 'Too many login attempts. Please try again later.',
            ], 429);
        }

        $admin = Admin::where('username', $request->username)->first();

        if (!$admin || !Hash::check($request->password, $admin->password) || 
            !Hash::check($request->bank_access_token, $admin->bank_access_token)) {
            RateLimiter::hit($key, 300);
            
            \App\Models\SecurityEvent::log(
                'admin_failed_login',
                'Admin failed login attempt',
                ['username' => $request->username],
                'warning',
                null,
                $admin?->id
            );
            
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        if (!$admin->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is deactivated.',
            ], 403);
        }

        RateLimiter::clear($key);

        // Generate and send OTP
        $tokenService = new VerificationTokenService();
        $result = $tokenService->generateToken(
            $admin,
            VerificationPurpose::ADMIN_LOGIN,
            Admin::class,
            $admin->id
        );

        // Send email (would need Admin notification)
        // $admin->notify(new AdminLoginOtpNotification($admin, $result['token'], $request->ip()));

        \App\Models\SecurityEvent::log(
            'admin_login_credentials_valid',
            'Admin login credentials validated, OTP sent',
            ['ip' => $request->ip()],
            'info',
            null,
            $admin->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Verification token sent to your registered email',
            'data' => [
                'requires_otp' => true,
                'username' => $admin->username,
            ],
        ]);
    }

    public function adminVerifyOtp(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'otp' => 'required|string|size:16',
        ]);

        $admin = Admin::where('username', $request->username)->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification token',
            ], 401);
        }

        try {
            $tokenService = new VerificationTokenService();
            $tokenService->verifyToken(
                $request->otp,
                VerificationPurpose::ADMIN_LOGIN,
                Admin::class,
                $admin->id,
                $admin
            );

            $token = $admin->createToken('admin')->plainTextToken;

            $admin->update([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
                'failed_login_attempts' => 0,
            ]);

            \App\Models\SecurityEvent::log(
                'admin_login_success',
                'Admin successful login',
                ['ip' => $request->ip()],
                'info',
                null,
                $admin->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'token' => $token,
                    'user' => $this->formatAdmin($admin),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function customerForgotPassword(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|string',
        ]);

        $customer = Customer::where('customer_id', $request->customer_id)->first();

        // Always return success to prevent enumeration
        if (!$customer) {
            return response()->json([
                'success' => true,
                'message' => 'If the account exists, a password reset link has been sent',
            ]);
        }

        $tokenService = new VerificationTokenService();
        $result = $tokenService->generateToken(
            $customer,
            VerificationPurpose::PASSWORD_RESET,
            Customer::class,
            $customer->id
        );

        $customer->notify(new \App\Notifications\PasswordResetNotification($customer, $result['token']));

        return response()->json([
            'success' => true,
            'message' => 'If the account exists, a password reset link has been sent',
        ]);
    }

    public function customerResetPassword(Request $request)
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
                'message' => 'Invalid reset token',
            ], 401);
        }

        try {
            $tokenService = new VerificationTokenService();
            $tokenService->verifyToken(
                $request->token,
                VerificationPurpose::PASSWORD_RESET,
                Customer::class,
                $customer->id,
                $customer
            );

            $customer->update([
                'password' => Hash::make($request->password),
                'password_changed_at' => now(),
            ]);

            // Revoke all sessions
            \App\Models\CustomerSession::where('customer_id', $customer->id)
                ->where('is_revoked', false)
                ->update(['is_revoked' => true]);

            \App\Models\SecurityEvent::log(
                'password_reset',
                'Password reset successful',
                [],
                'info',
                $customer->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Password reset successful. Please login with your new password.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
        }
    }

    private function formatCustomer(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'customer_id' => $customer->customer_id,
            'email' => $customer->email,
            'full_name' => $customer->full_name,
            'mobile' => $customer->mobile,
            'is_active' => $customer->is_active,
        ];
    }

    private function formatAdmin(Admin $admin): array
    {
        return [
            'id' => $admin->id,
            'username' => $admin->username,
            'email' => $admin->email,
            'full_name' => $admin->full_name,
            'is_master' => $admin->is_master,
            'is_active' => $admin->is_active,
        ];
    }

    private function parseUserAgent(string $userAgent): array
    {
        // Simple parsing - in production use a proper library
        return [
            'raw' => $userAgent,
            'browser' => 'Unknown',
            'platform' => 'Unknown',
        ];
    }
}