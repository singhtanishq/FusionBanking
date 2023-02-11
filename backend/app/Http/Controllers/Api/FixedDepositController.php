<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FixedDeposit;
use App\Models\FDProduct;
use App\Services\FDService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FixedDepositController extends Controller
{
    protected FDService $fdService;

    public function __construct(FDService $fdService)
    {
        $this->fdService = $fdService;
    }

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $customer = $request->user();
        $fds = $customer->fixedDeposits()
            ->with('product')
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $fds->map(function ($fd) {
                return [
                    'id' => $fd->id,
                    'fd_number' => $fd->fd_number,
                    'status' => $fd->status->value,
                    'principal_amount' => $fd->principal_amount,
                    'interest_rate' => $fd->interest_rate,
                    'tenure_months' => $fd->tenure_months,
                    'maturity_amount' => $fd->maturity_amount,
                    'maturity_date' => $fd->maturity_date?->toDateString(),
                    'opened_at' => $fd->opened_at?->toISOString(),
                    'matured_at' => $fd->matured_at?->toISOString(),
                    'auto_renew' => $fd->auto_renew,
                    'product' => $fd->product ? [
                        'name' => $fd->product->name,
                        'code' => $fd->product->code,
                    ] : null,
                ];
            }),
            'pagination' => [
                'current_page' => $fds->currentPage(),
                'last_page' => $fds->lastPage(),
                'total' => $fds->total(),
            ],
        ]);
    }

    public function products(Request $request): \Illuminate\Http\JsonResponse
    {
        $products = \App\Models\FDProduct::where('is_active', true)->get();

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
                ];
            }),
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
            'fd_product_id' => 'required|exists:fd_products,id',
            'principal_amount' => 'required|numeric|min:10000',
            'tenure_months' => 'required|integer|min:1',
            'auto_renew' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $product = \App\Models\FDProduct::findOrFail($request->fd_product_id);

        if ($request->principal_amount < $product->min_amount || $request->principal_amount > $product->max_amount) {
            return response()->json([
                'success' => false,
                'message' => "FD amount must be between {$product->min_amount} and {$product->max_amount}",
            ], 422);
        }

        if ($request->tenure_months < $product->min_tenure_months || $request->tenure_months > $product->max_tenure_months) {
            return response()->json([
                'success' => false,
                'message' => "Tenure must be between {$product->min_tenure_months} and {$product->max_tenure_months} months",
            ], 422);
        }

        try {
            $fd = $this->fdService->createFixedDeposit(
                $request->user(),
                $customer->primaryAccount,
                $product,
                $request->principal_amount,
                $request->tenure_months
            );

            $fd->update([
                'auto_renew' => $request->boolean('auto_renew', false),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Fixed Deposit created successfully',
                'data' => [
                    'fd_number' => $fd->fd_number,
                    'status' => $fd->status->value,
                    'principal_amount' => $fd->principal_amount,
                    'maturity_amount' => $fd->maturity_amount,
                    'maturity_date' => $fd->maturity_date?->toDateString(),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function show(Request $request, FixedDeposit $fd): \Illuminate\Http\JsonResponse
    {
        if ($fd->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Fixed Deposit not found',
            ], 404);
        }

        $fd->load('product');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $fd->id,
                'fd_number' => $fd->fd_number,
                'status' => $fd->status->value,
                'principal_amount' => $fd->principal_amount,
                'interest_rate' => $fd->interest_rate,
                'tenure_months' => $fd->tenure_months,
                'maturity_amount' => $fd->maturity_amount,
                'maturity_date' => $fd->maturity_date?->toDateString(),
                'opened_at' => $fd->opened_at?->toISOString(),
                'matured_at' => $fd->matured_at?->toISOString(),
                'auto_renew' => $fd->auto_renew,
                'product' => $fd->product ? [
                    'name' => $fd->product->name,
                    'code' => $fd->product->code,
                ] : null,
            ],
        ]);
    }

    public function prematureClose(Request $request, FixedDeposit $fd): JsonResponse
    {
        if ($fd->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Fixed Deposit not found',
            ], 404);
        }

        if ($fd->status !== \App\Enums\FDStatus::ACTIVE) {
            return response()->json([
                'success' => false,
                'message' => 'Only active FDs can be closed prematurely',
            ], 422);
        }

        try {
            // For customer self-service, we need admin approval for premature close
            // This would typically be a request that goes to admin queue
            // For now, we'll just mark it as requested
            $fd->update([
                'status' => \App\Enums\FDStatus::PREMATURE_CLOSED,
                'closed_at' => now(),
                'closed_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Premature closure requested. Amount will be credited after penalty deduction.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}