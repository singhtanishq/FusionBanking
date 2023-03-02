<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationStep;
use App\Models\ApplicationReview;
use App\Models\Customer;
use App\Models\Admin;
use App\Services\ApplicationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    protected ApplicationService $applicationService;

    public function __construct(ApplicationService $applicationService)
    {
        $this->applicationService = $applicationService;
    }

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Application::with(['customer', 'steps'])
            ->latest();

        // Filters
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('acknowledgement_number') && $request->acknowledgement_number) {
            $query->where('acknowledgement_number', 'like', "%{$request->acknowledgement_number}%");
        }

        if ($request->has('name') && $request->name) {
            $query->whereHas('personalInfo', function ($q) use ($request) {
                $q->where('full_name', 'like', "%{$request->name}%");
            });
        }

        if ($request->has('email') && $request->email) {
            $query->whereHas('contactInfo', function ($q) use ($request) {
                $q->where('email', 'like', "%{$request->email}%");
            });
        }

        if ($request->has('account_type') && $request->account_type) {
            $query->where('preferred_account_type', $request->account_type);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $applications = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $applications->map(function ($app) {
                return [
                    'id' => $app->id,
                    'acknowledgement_number' => $app->acknowledgement_number,
                    'status' => $app->status->value,
                    'preferred_account_type' => $app->preferred_account_type,
                    'submitted_at' => $app->submitted_at?->toISOString(),
                    'approved_at' => $app->approved_at?->toISOString(),
                    'applicant_name' => $app->personalInfo?->full_name,
                    'email' => $app->contactInfo?->email,
                    'mobile' => $app->contactInfo?->mobile_number,
                    'progress_percentage' => $app->getProgressPercentage(),
                    'created_at' => $app->created_at?->toISOString(),
                ];
            }),
            'pagination' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    public function show(Request $request, Application $application): JsonResponse
    {
        $application->load([
            'personalInfo', 'contactInfo', 'addressInfo', 'kycInfo',
            'steps.documents',
            'reviews.admin',
            'customer',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $application->id,
                'acknowledgement_number' => $application->acknowledgement_number,
                'status' => $application->status->value,
                'preferred_account_type' => $application->preferred_account_type,
                'submitted_at' => $application->submitted_at?->toISOString(),
                'approved_at' => $application->approved_at?->toISOString(),
                'rejected_at' => $application->rejected_at?->toISOString(),
                'rejection_reason' => $application->rejection_reason,
                'personal_info' => $application->personalInfo ? [
                    'full_name' => $application->personalInfo->full_name,
                    'father_name' => $application->personalInfo->father_name,
                    'mother_name' => $application->personalInfo->mother_name,
                    'date_of_birth' => $application->personalInfo->date_of_birth?->toDateString(),
                    'gender' => $application->personalInfo->gender,
                    'marital_status' => $application->personalInfo->marital_status,
                    'nationality' => $application->personalInfo->nationality,
                    'occupation' => $application->personalInfo->occupation,
                    'annual_income' => $application->personalInfo->annual_income,
                    'preferred_account_type' => $application->personalInfo->preferred_account_type,
                ] : null,
                'contact_info' => $application->contactInfo ? [
                    'mobile_number' => $application->contactInfo->mobile_number,
                    'email' => $application->contactInfo->email,
                    'alternate_mobile' => $application->contactInfo->alternate_mobile,
                    'address_line_1' => $application->contactInfo->address_line_1,
                    'address_line_2' => $application->contactInfo->address_line_2,
                    'city' => $application->contactInfo->city,
                    'state' => $application->contactInfo->state,
                    'postal_code' => $application->contactInfo->postal_code,
                    'country' => $application->contactInfo->country,
                ] : null,
                'kyc_info' => $application->kycInfo ? [
                    'pan_number' => $application->kycInfo->pan_number,
                    'aadhaar_number' => $application->kycInfo->aadhaar_number,
                    'kyc_type' => $application->kycInfo->kyc_type,
                ] : null,
                'address_info' => $application->addressInfo ? [
                    'residential_address_line_1' => $application->addressInfo->residential_address_line_1,
                    'residential_address_line_2' => $application->addressInfo->residential_address_line_2,
                    'residential_city' => $application->addressInfo->residential_city,
                    'residential_state' => $application->addressInfo->residential_state,
                    'residential_postal_code' => $application->addressInfo->residential_postal_code,
                    'residential_country' => $application->addressInfo->residential_country,
                    'residential_landmark' => $application->addressInfo->residential_landmark,
                    'permanent_address_line_1' => $application->addressInfo->permanent_address_line_1,
                    'permanent_address_line_2' => $application->addressInfo->permanent_address_line_2,
                    'permanent_city' => $application->addressInfo->permanent_city,
                    'permanent_state' => $application->addressInfo->permanent_state,
                    'permanent_postal_code' => $application->addressInfo->permanent_postal_code,
                    'permanent_country' => $application->addressInfo->permanent_country,
                    'permanent_landmark' => $application->addressInfo->permanent_landmark,
                    'same_as_residential' => $application->addressInfo->same_as_residential,
                ] : null,
                'steps' => $application->steps->map(function ($step) {
                    return [
                        'id' => $step->id,
                        'step_key' => $step->step_key,
                        'step_name' => $step->step_name,
                        'step_order' => $step->step_order,
                        'status' => $step->status->value,
                        'reviewed_at' => $step->reviewed_at?->toISOString(),
                        'reviewed_by' => $step->reviewer?->full_name,
                        'rejection_reason' => $step->rejection_reason,
                        'documents' => $step->documents->map(function ($doc) {
                            return [
                                'id' => $doc->id,
                                'document_type' => $doc->document_type,
                                'document_category' => $doc->document_category,
                                'original_filename' => $doc->original_filename,
                                'is_verified' => $doc->is_verified,
                                'verified_at' => $doc->verified_at?->toISOString(),
                                'rejection_reason' => $doc->rejection_reason,
                            ];
                        }),
                    ];
                }),
                'timeline' => $application->reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'action' => $review->action,
                        'step_name' => $review->step?->step_name,
                        'previous_status' => $review->previous_status->value,
                        'new_status' => $review->new_status->value,
                        'reason' => $review->reason,
                        'admin_name' => $review->admin?->full_name,
                        'created_at' => $review->created_at?->toISOString(),
                    ];
                }),
            ],
        ]);
    }

    public function reviewStep(Request $request, Application $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'step_key' => ['required', \Illuminate\Validation\Rule::in(['personal_info', 'contact_info', 'kyc_info', 'address_info', 'documents', 'review'])],
            'action' => ['required', \Illuminate\Validation\Rule::in(['approve', 'reject', 'request_correction'])],
            'reason' => 'required|string|min:5|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->applicationService->reviewStep(
                $request->user(),
                $application,
                $request->step_key,
                $request->action,
                $request->reason
            );

            return response()->json([
                'success' => true,
                'message' => 'Step reviewed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function approve(Request $request, Application $application): JsonResponse
    {
        if ($application->status !== \App\Enums\ApplicationStatus::FINAL_REVIEW &&
            $application->status !== \App\Enums\ApplicationStatus::UNDER_REVIEW) {
            return response()->json([
                'success' => false,
                'message' => 'Application is not ready for final approval',
            ], 422);
        }

        try {
            $this->applicationService->approveApplication($request->user(), $application);

            return response()->json([
                'success' => true,
                'message' => 'Application approved and account created',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function reject(Request $request, Application $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|min:5|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a rejection reason.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $application->update([
            'status' => \App\Enums\ApplicationStatus::REJECTED,
            'rejected_at' => now(),
            'rejection_reason' => $request->reason,
        ]);

        // Log audit
        \App\Models\AuditLog::log(
            'application_rejected',
            'application',
            $application->id,
            $request->user(),
            ['status' => $application->getOriginal('status')],
            ['status' => \App\Enums\ApplicationStatus::REJECTED->value, 'reason' => $request->reason]
        );

        return response()->json([
            'success' => true,
            'message' => 'Application rejected',
        ]);
    }
}