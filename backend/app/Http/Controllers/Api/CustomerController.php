<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerAddress;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $customer = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $customer->id,
                'customer_id' => $customer->customer_id,
                'email' => $customer->email,
                'mobile' => $customer->mobile,
                'alternate_mobile' => $customer->alternate_mobile,
                'full_name' => $customer->full_name,
                'father_name' => $customer->father_name,
                'mother_name' => $customer->mother_name,
                'date_of_birth' => $customer->date_of_birth?->toDateString(),
                'gender' => $customer->gender,
                'marital_status' => $customer->marital_status,
                'nationality' => $customer->nationality,
                'occupation' => $customer->occupation,
                'annual_income' => $customer->annual_income,
                'pan_number' => $customer->pan_number ? $this->maskPan($customer->pan_number) : null,
                'aadhaar_number' => $customer->aadhaar_number ? $this->maskAadhaar($customer->aadhaar_number) : null,
                'kyc_type' => $customer->kyc_type,
                'kyc_verified_at' => $customer->kyc_verified_at?->toISOString(),
                'netbanking_activated_at' => $customer->netbanking_activated_at?->toISOString(),
                'last_login_at' => $customer->last_login_at?->toISOString(),
                'created_at' => $customer->created_at?->toISOString(),
                'is_active' => $customer->is_active,
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $customer = $request->user();

        $validator = Validator::make($request->all(), [
            'email' => 'sometimes|email|max:255|unique:customers,email,' . $customer->id,
            'alternate_mobile' => ['nullable', 'regex:/^[6-9]\d{9}$/'],
            'occupation' => 'sometimes|string|min:2|max:100',
            'annual_income' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $customer = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:10|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!Hash::check($request->current_password, $customer->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 422);
        }

        $customer->update([
            'password' => Hash::make($request->new_password),
            'password_changed_at' => now(),
        ]);

        // Revoke all sessions except current
        $currentToken = $request->user()->currentAccessToken();
        $customer->tokens()->where('id', '!=', $currentToken?->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully. Please login again.',
        ]);
    }

    private function maskPan(string $pan): string
    {
        if (strlen($pan) !== 10) return $pan;
        return substr($pan, 0, 5) . '****' . substr($pan, -1);
    }

    private function maskAadhaar(string $aadhaar): string
    {
        $cleaned = str_replace(' ', '', $aadhaar);
        if (strlen($cleaned) !== 12) return $aadhaar;
        return 'XXXX XXXX ' . substr($cleaned, -4);
    }
}