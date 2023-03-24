<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanProduct;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LoanController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Loan::with(['customer', 'product', 'account'])
            ->latest();

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('loan_number', 'like', "%{$request->search}%")
                  ->orWhereHas('customer', function ($q) use ($request) {
                      $q->where('full_name', 'like', "%{$request->search}%")
                        ->orWhere('customer_id', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->has('product_id') && $request->product_id) {
            $query->where('loan_product_id', $request->product_id);
        }

        $loans = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $loans->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'loan_number' => $loan->loan_number,
                    'status' => $loan->status->value,
                    'principal_amount' => $loan->principal_amount,
                    'approved_amount' => $loan->approved_amount,
                    'interest_rate' => $loan->interest_rate,
                    'tenure_months' => $loan->tenure_months,
                    'emi' => $loan->emi,
                    'total_repayment' => $loan->total_repayment,
                    'status' => $loan->status->value,
                    'customer' => $loan->customer ? [
                        'customer_id' => $loan->customer->customer_id,
                        'full_name' => $loan->customer->full_name,
                    ] : null,
                    'product' => $loan->product ? [
                        'name' => $loan->product->name,
                    ] : null,
                    'disbursed_at' => $loan->disbursed_at?->toISOString(),
                    'maturity_date' => $loan->maturity_date?->toDateString(),
                ];
            }),
            'pagination' => [
                'current_page' => $loans->currentPage(),
                'last_page' => $loans->lastPage(),
                'total' => $loans->total(),
            ],
        ]);
    }

    public function show(Request $request, Loan $loan): JsonResponse
    {
        $loan->load(['customer', 'product', 'account', 'payments' => function ($q) {
            $q->latest()->limit(20);
        }, 'approvedBy', 'rejectedBy']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $loan->id,
                'loan_number' => $loan->loan_number,
                'status' => $loan->status->value,
                'principal_amount' => $loan->principal_amount,
                'approved_amount' => $loan->approved_amount,
                'interest_rate' => $loan->interest_rate,
                'tenure_months' => $loan->tenure_months,
                'emi' => $loan->emi,
                'total_interest' => $loan->total_interest,
                'total_repayment' => $loan->total_repayment,
                'disbursed_at' => $loan->disbursed_at?->toISOString(),
                'first_emi_date' => $loan->first_emi_date?->toDateString(),
                'maturity_date' => $loan->maturity_date?->toDateString(),
                'purpose' => $loan->purpose,
                'employment_type' => $loan->employment_type,
                'employer_name' => $loan->employer_name,
                'employment_duration_months' => $loan->employment_duration_months,
                'monthly_salary' => $loan->monthly_salary,
                'existing_obligations' => $loan->existing_obligations,
                'rejection_reason' => $loan->rejection_reason,
                'approved_at' => $loan->approved_at?->toISOString(),
                'rejected_at' => $loan->rejected_at?->toISOString(),
                'customer' => $loan->customer ? [
                    'customer_id' => $loan->customer->customer_id,
                    'full_name' => $loan->customer->full_name,
                    'email' => $loan->customer->email,
                    'mobile' => $loan->customer->mobile,
                    'annual_income' => $loan->customer->annual_income,
                    'occupation' => $loan->customer->occupation,
                ] : null,
                'product' => $loan->product ? [
                    'name' => $loan->product->name,
                    'interest_rate' => $loan->product->interest_rate,
                    'processing_fee_percent' => $loan->product->processing_fee_percent,
                ] : null,
                'account' => $loan->account ? [
                    'account_number' => $loan->account->account_number,
                ] : null,
                'approved_by' => $loan->approvedBy ? [
                    'full_name' => $loan->approvedBy->full_name,
                ] : null,
                'rejected_by' => $loan->rejectedBy ? [
                    'full_name' => $loan->rejectedBy->full_name,
                ] : null,
                'payments' => $loan->payments->map(function ($payment) {
                    return [
                        'payment_number' => $payment->payment_number,
                        'due_date' => $payment->due_date?->toDateString(),
                        'paid_date' => $payment->paid_date?->toISOString(),
                        'principal_component' => $payment->principal_component,
                        'interest_component' => $payment->interest_component,
                        'total_amount' => $payment->total_amount,
                        'status' => $payment->status,
                    ];
                }),
                'repayment_ratio' => $loan->getRepaymentRatio(),
            ],
        ]);
    }

    public function approve(Request $request, Loan $loan): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'approved_amount' => 'required|numeric|min:10000',
            'interest_rate' => 'required|numeric|min:0|max:30',
            'tenure_months' => 'required|integer|min:1',
            'approval_comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $loanService = app(\App\Services\LoanService::class);

        try {
            $loanService->approveLoan(
                $loan,
                $request->user(),
                $request->approved_amount,
                $request->interest_rate,
                $request->tenure_months
            );

            \App\Models\AuditLog::log(
                'loan_approved',
                'loan',
                $loan->id,
                $request->user(),
                ['status' => $loan->getOriginal('status')],
                [
                    'status' => \App\Enums\LoanStatus::APPROVED->value,
                    'approved_amount' => $request->approved_amount,
                    'comment' => $request->approval_comment,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Loan approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function reject(Request $request, Loan $loan): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|min:5|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a rejection reason.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $loanService = app(\App\Services\LoanService::class);
        $loanService->rejectLoan($loan, $request->user(), $request->reason);

        \App\Models\AuditLog::log(
            'loan_rejected',
            'loan',
            $loan->id,
            $request->user(),
            ['status' => $loan->getOriginal('status')],
            ['status' => \App\Enums\LoanStatus::REJECTED->value, 'reason' => $request->reason]
        );

        return response()->json([
            'success' => true,
            'message' => 'Loan rejected',
        ]);
    }

    public function disburse(Request $request, Loan $loan): JsonResponse
    {
        if ($loan->status !== \App\Enums\LoanStatus::APPROVED) {
            return response()->json([
                'success' => false,
                'message' => 'Loan must be approved before disbursement',
            ], 422);
        }

        $loanService = app(\App\Services\LoanService::class);

        try {
            $loanService->disburseLoan($loan);

            return response()->json([
                'success' => true,
                'message' => 'Loan disbursed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}