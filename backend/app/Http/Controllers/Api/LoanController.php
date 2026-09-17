<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanProduct;
use App\Services\LoanService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LoanController extends Controller
{
    protected LoanService $loanService;

    public function __construct(LoanService $loanService)
    {
        $this->loanService = $loanService;
    }

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $customer = $request->user();
        $loans = $customer->loans()
            ->with('product')
            ->latest()
            ->paginate($request->get('per_page', 20));

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
                    'total_interest' => $loan->total_interest,
                    'total_repayment' => $loan->total_repayment,
                    'purpose' => $loan->purpose,
                    'disbursed_at' => $loan->disbursed_at?->toISOString(),
                    'maturity_date' => $loan->maturity_date?->toDateString(),
                    'product' => $loan->product ? [
                        'name' => $loan->product->name,
                        'code' => $loan->product->code,
                    ] : null,
                ];
            }),
            'pagination' => [
                'current_page' => $loans->currentPage(),
                'last_page' => $loans->lastPage(),
                'total' => $loans->total(),
            ],
        ]);
    }

    public function products(Request $request): \Illuminate\Http\JsonResponse
    {
        $products = \App\Models\LoanProduct::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'data' => $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'code' => $product->code,
                    'description' => $product->description,
                    'min_amount' => $product->min_amount,
                    'max_amount' => $product->max_amount,
                    'min_tenure_months' => $product->min_tenure_months,
                    'max_tenure_months' => $product->max_tenure_months,
                    'interest_rate' => $product->interest_rate,
                    'processing_fee_percent' => $product->processing_fee_percent,
                ];
            }),
        ]);
    }

    public function calculateEmi(Request $request): \Illuminate\Http\JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'principal' => 'required|numeric|min:10000',
            'annual_rate' => 'required|numeric|min:0|max:30',
            'tenure_months' => 'required|integer|min:1|max:360',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $emi = $this->loanService->calculateEMI(
            $request->principal,
            $request->annual_rate,
            $request->tenure_months
        );

        $totalInterest = $this->loanService->calculateTotalInterest(
            $request->principal,
            $request->annual_rate,
            $request->tenure_months
        );

        $totalRepayment = $this->loanService->calculateTotalRepayment(
            $request->principal,
            $request->annual_rate,
            $request->tenure_months
        );

        return response()->json([
            'success' => true,
            'data' => [
                'emi' => $emi,
                'total_interest' => $totalInterest,
                'total_repayment' => $totalRepayment,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $customer = $request->user();
        $account = $customer->primaryAccount;

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'No active primary account found',
            ], 422);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'loan_product_id' => 'required|exists:loan_products,id',
            'principal_amount' => 'required|numeric|min:10000',
            'tenure_months' => 'required|integer|min:12',
            'purpose' => 'required|string|min:10|max:500',
            'employment_type' => ['required', \Illuminate\Validation\Rule::in(['salaried', 'self_employed', 'business', 'other'])],
            'employer_name' => 'nullable|string|max:255',
            'employment_duration_months' => 'nullable|integer|min:0',
            'monthly_salary' => 'required|numeric|min:1',
            'existing_obligations' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $product = \App\Models\LoanProduct::findOrFail($request->loan_product_id);

        if ($request->principal_amount < $product->min_amount || $request->principal_amount > $product->max_amount) {
            return response()->json([
                'success' => false,
                'message' => "Loan amount must be between {$product->min_amount} and {$product->max_amount}",
            ], 422);
        }

        if ($request->tenure_months < $product->min_tenure_months || $request->tenure_months > $product->max_tenure_months) {
            return response()->json([
                'success' => false,
                'message' => "Tenure must be between {$product->min_tenure_months} and {$product->max_tenure_months} months",
            ], 422);
        }

        try {
            $loan = $this->loanService->applyForLoan(
                $request->user(),
                $customer->primaryAccount,
                $product,
                $request->principal_amount,
                $request->tenure_months,
                $request->purpose,
                $request->employment_type,
                $request->employer_name,
                $request->employment_duration_months,
                $request->monthly_salary,
                $request->existing_obligations ?? 0
            );

            return response()->json([
                'success' => true,
                'message' => 'Loan application submitted successfully',
                'data' => [
                    'loan_number' => $loan->loan_number,
                    'status' => $loan->status->value,
                    'emi' => $loan->emi,
                    'total_repayment' => $loan->total_repayment,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function show(Request $request, \App\Models\Loan $loan): \Illuminate\Http\JsonResponse
    {
        if ($loan->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Loan not found',
            ], 404);
        }

        $loan->load(['product', 'payments' => function ($q) {
            $q->latest()->limit(10);
        }]);

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
                'purpose' => $loan->purpose,
                'employment_type' => $loan->employment_type,
                'employer_name' => $loan->employer_name,
                'monthly_salary' => $loan->monthly_salary,
                'existing_obligations' => $loan->existing_obligations,
                'disbursed_at' => $loan->disbursed_at?->toISOString(),
                'first_emi_date' => $loan->first_emi_date?->toDateString(),
                'maturity_date' => $loan->maturity_date?->toDateString(),
                'repayment_ratio' => $loan->getRepaymentRatio(),
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
                'product' => $loan->product ? [
                    'name' => $loan->product->name,
                    'code' => $loan->product->code,
                ] : null,
            ],
        ]);
    }
}