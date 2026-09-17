<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AccountController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = BankAccount::with(['customer'])
            ->latest();

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('account_number', 'like', "%{$request->search}%")
                  ->orWhereHas('customer', function ($q) use ($request) {
                      $q->where('customer_id', 'like', "%{$request->search}%")
                        ->orWhere('full_name', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('account_type') && $request->account_type) {
            $query->where('account_type', $request->account_type);
        }

        $accounts = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $accounts->map(function ($account) {
                return [
                    'id' => $account->id,
                    'account_number' => $account->account_number,
                    'account_type' => $account->account_type,
                    'status' => $account->status->value,
                    'balance' => $account->balance,
                    'available_balance' => $account->available_balance,
                    'ifsc_code' => $account->ifsc_code,
                    'opening_date' => $account->opening_date?->toDateString(),
                    'is_primary' => $account->is_primary,
                    'customer' => $account->customer ? [
                        'customer_id' => $account->customer->customer_id,
                        'full_name' => $account->customer->full_name,
                    ] : null,
                ];
            }),
            'pagination' => [
                'current_page' => $accounts->currentPage(),
                'last_page' => $accounts->lastPage(),
                'total' => $accounts->total(),
            ],
        ]);
    }

    public function show(Request $request, \App\Models\BankAccount $account): JsonResponse
    {
        $account->load(['customer', 'transactions' => function ($q) {
            $q->latest()->limit(50);
        }]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $account->id,
                'account_number' => $account->account_number,
                'account_type' => $account->account_type,
                'status' => $account->status->value,
                'balance' => $account->balance,
                'available_balance' => $account->available_balance,
                'ifsc_code' => $account->ifsc_code,
                'opening_date' => $account->opening_date?->toDateString(),
                'closing_date' => $account->closing_date?->toDateString(),
                'is_primary' => $account->is_primary,
                'frozen_at' => $account->frozen_at?->toISOString(),
                'frozen_reason' => $account->frozen_reason,
                'closed_at' => $account->closed_at?->toISOString(),
                'closed_reason' => $account->closed_reason,
                'customer' => $account->customer ? [
                    'customer_id' => $account->customer->customer_id,
                    'full_name' => $account->customer->full_name,
                    'email' => $account->customer->email,
                    'mobile' => $account->customer->mobile,
                ] : null,
                'transactions' => $account->transactions->map(function ($txn) {
                    return [
                        'reference_number' => $txn->reference_number,
                        'type' => $txn->type->value,
                        'direction' => $txn->direction,
                        'amount' => $txn->amount,
                        'description' => $txn->description,
                        'created_at' => $txn->created_at?->toISOString(),
                        'closing_balance' => $txn->closing_balance,
                    ];
                }),
            ],
        ]);
    }

    public function freeze(Request $request, \App\Models\BankAccount $account): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'reason' => 'required|string|min:5|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a reason for freezing the account.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $account->update([
            'status' => \App\Enums\AccountStatus::FROZEN,
            'frozen_at' => now(),
            'frozen_by' => $request->user()->id,
            'frozen_reason' => $request->reason,
        ]);

        \App\Models\AuditLog::log(
            'account_frozen',
            'bank_account',
            $account->id,
            $request->user(),
            ['status' => $account->getOriginal('status')],
            ['status' => \App\Enums\AccountStatus::FROZEN->value, 'reason' => $request->reason]
        );

        return response()->json([
            'success' => true,
            'message' => 'Account frozen successfully',
        ]);
    }

    public function unfreeze(Request $request, \App\Models\BankAccount $account): JsonResponse
    {
        $account->update([
            'status' => \App\Enums\AccountStatus::ACTIVE,
            'frozen_at' => null,
            'frozen_by' => null,
            'frozen_reason' => null,
        ]);

        \App\Models\AuditLog::log(
            'account_unfrozen',
            'bank_account',
            $account->id,
            $request->user(),
            ['status' => \App\Enums\AccountStatus::FROZEN->value],
            ['status' => \App\Enums\AccountStatus::ACTIVE->value]
        );

        return response()->json([
            'success' => true,
            'message' => 'Account unfrozen successfully',
        ]);
    }

    public function close(Request $request, \App\Models\BankAccount $account): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'reason' => 'required|string|min:5|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a reason for closing the account.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $account->update([
            'status' => \App\Enums\AccountStatus::CLOSED,
            'closed_at' => now(),
            'closed_by' => $request->user()->id,
            'closed_reason' => $request->reason,
        ]);

        \App\Models\AuditLog::log(
            'account_closed',
            'bank_account',
            $account->id,
            $request->user(),
            ['status' => $account->getOriginal('status')],
            ['status' => \App\Enums\AccountStatus::CLOSED->value, 'reason' => $request->reason]
        );

        return response()->json([
            'success' => true,
            'message' => 'Account closed successfully',
        ]);
    }
}