<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\PersonalInformation;
use App\Models\ContactInformation;
use App\Models\KycInformation;
use App\Models\AddressInformation;
use App\Models\KycDocument;
use App\Services\ApplicationService;
use App\Services\AccountService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ApplicationController extends Controller
{
    protected ApplicationService $applicationService;
    protected AccountService $accountService;

    public function __construct(ApplicationService $applicationService, AccountService $accountService)
    {
        $this->applicationService = $applicationService;
        $this->accountService = $accountService;
    }

    public function store(Request $request): JsonResponse
    {
        $application = $this->applicationService->createDraftApplication();

        return response()->json([
            'success' => true,
            'message' => 'Draft application created',
            'data' => [
                'application_id' => $application->id,
                'acknowledgement_number' => $application->acknowledgement_number,
            ],
        ], 201);
    }

    public function savePersonalInfo(Request $request, Application $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:100',
            'father_name' => 'required|string|max:100',
            'mother_name' => 'required|string|max:100',
            'date_of_birth' => 'required|date|before:today',
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'marital_status' => ['required', Rule::in(['single', 'married', 'divorced', 'widowed'])],
            'nationality' => 'required|string|max:100',
            'occupation' => 'required|string|max:100',
            'annual_income' => 'required|numeric|min:0',
            'preferred_account_type' => ['required', Rule::in(['savings', 'current'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $this->applicationService->savePersonalInformation($application, $validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Personal information saved',
        ]);
    }

    public function saveContactInfo(Request $request, Application $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'mobile_number' => ['required', 'regex:/^[6-9]\d{9}$/'],
            'email' => 'required|email|max:255',
            'alternate_mobile' => ['nullable', 'regex:/^[6-9]\d{9}$/'],
            'address_line_1' => 'required|string|min:5|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|min:2|max:100',
            'state' => 'required|string|min:2|max:100',
            'postal_code' => ['required', 'regex:/^\d{6}$/'],
            'country' => 'string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $this->applicationService->saveContactInformation($application, $validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Contact information saved',
        ]);
    }

    public function saveKycInfo(Request $request, Application $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pan_number' => ['required', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i'],
            'aadhaar_number' => ['required', 'regex:/^\d{12}$/'],
            'kyc_type' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $this->applicationService->saveKycInformation($application, $validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'KYC information saved',
        ]);
    }

    public function saveAddressInfo(Request $request, Application $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'residential_address_line_1' => 'required|string|min:5|max:255',
            'residential_address_line_2' => 'nullable|string|max:255',
            'residential_city' => 'required|string|min:2|max:100',
            'residential_state' => 'required|string|min:2|max:100',
            'residential_postal_code' => ['required', 'regex:/^\d{6}$/'],
            'residential_country' => 'string|max:100',
            'residential_landmark' => 'nullable|string|max:255',
            'permanent_address_line_1' => 'required|string|min:5|max:255',
            'permanent_address_line_2' => 'nullable|string|max:255',
            'permanent_city' => 'required|string|min:2|max:100',
            'permanent_state' => 'required|string|min:2|max:100',
            'permanent_postal_code' => ['required', 'regex:/^\d{6}$/'],
            'permanent_country' => 'string|max:100',
            'permanent_landmark' => 'nullable|string|max:255',
            'same_as_residential' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $this->applicationService->saveAddressInformation($application, $validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Address information saved',
        ]);
    }

    public function uploadDocument(Request $request, Application $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'step_key' => ['required', Rule::in(['personal_info', 'contact_info', 'kyc_info', 'address_info', 'documents'])],
            'document_type' => ['required', Rule::in(['pan', 'passport', 'voter_id', 'driving_license', 'aadhaar', 'utility_bill', 'bank_statement'])],
            'document_category' => ['required', Rule::in(['identity_proof', 'address_proof'])],
            'file' => 'required|file|max:5120|mimes:pdf,jpg,jpeg,png',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $step = $application->steps()->where('step_key', $request->step_key)->first();

        $file = $request->file('file');
        $storedFilename = 'kyc_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('kyc_documents/' . $application->id, $storedFilename, 'private');

        $document = KycDocument::create([
            'application_id' => $application->id,
            'application_step_id' => $step->id,
            'document_type' => $request->document_type,
            'document_category' => $request->document_category,
            'original_filename' => $file->getClientOriginalName(),
            'stored_filename' => $storedFilename,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'file_path' => $path,
        ]);

        $this->applicationService->checkStepDocumentsComplete($application, $request->step_key);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => [
                'document_id' => $document->id,
                'original_filename' => $document->original_filename,
                'stored_filename' => $document->stored_filename,
            ],
        ]);
    }

    public function submit(Application $application): JsonResponse
    {
        try {
            $this->applicationService->submitApplication($application);

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully',
                'data' => [
                    'acknowledgement_number' => $application->acknowledgement_number,
                    'submitted_at' => $application->submitted_at,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}