<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\VerificationToken;
use App\Enums\VerificationPurpose;
use App\Services\ApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TrackController extends Controller
{
    public function __construct(private ApplicationService $applicationService)
    {
    }

    /**
     * Public application status lookup by acknowledgement number.
     * Only exposes status information — never personal KYC data.
     */
    public function show(string $acknowledgementNumber): JsonResponse
    {
        $application = Application::with(['steps' => fn ($q) => $q->orderBy('step_order')])
            ->where('acknowledgement_number', $acknowledgementNumber)
            ->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => (string) $application->id,
                'acknowledgement_number' => $application->acknowledgement_number,
                'status' => $application->status->value,
                'preferred_account_type' => $application->preferred_account_type,
                'submitted_at' => $application->submitted_at?->toISOString(),
                'approved_at' => $application->approved_at?->toISOString(),
                'steps' => $application->steps->map(fn ($step) => [
                    'id' => (string) $step->id,
                    'step_key' => $step->step_key,
                    'step_name' => $step->step_name,
                    'step_order' => $step->step_order,
                    'status' => $step->status->value,
                    'reviewed_at' => $step->reviewed_at?->toISOString(),
                    'rejection_reason' => $step->rejection_reason,
                ])->values()->all(),
            ],
        ]);
    }

    /**
     * Verify a correction token before a public correction submission.
     */
    public function verify(Request $request, string $acknowledgementNumber): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string|min:8|max:128',
            'step_key' => ['required', 'string', Rule::in(['personal_info', 'contact_info', 'kyc_info', 'address_info', 'documents'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $application = Application::where('acknowledgement_number', $acknowledgementNumber)->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        $token = VerificationToken::where('token_hash', VerificationToken::hashToken($request->input('token')))
            ->where('purpose', VerificationPurpose::APPLICATION_CORRECTION)
            ->where('resource_type', Application::class)
            ->where('resource_id', $application->id)
            ->first();

        if (!$token || !$token->isValid()) {
            $token?->incrementAttempts();

            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification token',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token verified',
        ]);
    }

    /**
     * Submit corrected data for a step flagged for correction.
     * Requires the correction token that was issued to the applicant.
     */
    public function submitCorrection(Request $request, string $acknowledgementNumber, string $stepKey): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string|min:8|max:128',
            'data' => 'required|array|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $application = Application::where('acknowledgement_number', $acknowledgementNumber)->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        try {
            $correction = $this->applicationService->submitCorrection(
                $application,
                $stepKey,
                $request->input('data'),
                $request->input('token')
            );
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Correction submitted successfully',
            'data' => [
                'correction_id' => (string) $correction->id,
                'status' => $correction->status->value,
            ],
        ], 201);
    }
}
