<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FixedDeposit;
use App\Models\FDProduct;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FixedDepositController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = FixedDeposit::with(['customer', 'product', 'account'])
            ->latest();

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('fd_number', 'like', "%{$request->search}%")
                  ->orWhereHas('customer', function ($q) use ($request) {
                      $q->where('full_name', 'like', "%{$request->search}%")
                        ->orWhere('customer_id', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $fds = $query->paginate($request->get('per_page', 20));

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
                    'customer' => $fd->customer ? [
                        'customer_id' => $fd->customer->customer_id,
                        'full_name' => $fd->customer->full_name,
                    ] : null,
                    'product' => $fd->product ? [
                        'name' => $fd->product->name,
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

    public function show(Request $request, FixedDeposit $fd): JsonResponse
    {
        $fd->load(['customer', 'product', 'account', 'closedBy']);

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
                'closed_at' => $fd->closed_at?->toISOString(),
                'auto_renew' => $fd->auto_renew,
                'renewal_count' => $fd->renewal_count,
                'customer' => $fd->customer ? [
                    'customer_id' => $fd->customer->customer_id,
                    'full_name' => $fd->customer->full_name,
                    'email' => $fd->customer->email,
                    'mobile' => $fd->customer->mobile,
                ] : null,
                'product' => $fd->product ? [
                    'name' => $fd->product->name,
                    'interest_rate' => $fd->product->interest_rate,
                ] : null,
                'account' => $fd->account ? [
                    'account_number' => $fd->account->account_number,
                ] : null,
                'closed_by' => $fd->closedBy ? [
                    'full_name' => $fd->closedBy->full_name,
                ] : null,
            ],
        ]);
    }
}