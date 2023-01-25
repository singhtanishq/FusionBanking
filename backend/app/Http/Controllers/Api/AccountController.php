<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Transaction;
use App\Models\Customer;
use App\Services\AccountService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AccountController extends Controller
{
    protected AccountService $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $customer = $request->user();
        $accounts = $customer->accounts()
            ->with(['transactions' => function ($query) {
                $query->latest()->limit(5);
            }])
            ->get();

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
                    'recent_transactions' => $account->transactions->map(function ($txn) {
                        return [
                            'id' => $txn->id,
                            'reference_number' => $txn->reference_number,
                            'type' => $txn->type->value,
                            'direction' => $txn->direction,
                            'amount' => $txn->amount,
                            'description' => $txn->description,
                            'created_at' => $txn->created_at?->toISOString(),
                            'closing_balance' => $txn->closing_balance,
                        ];
                    }),
                ];
            }),
        ]);
    }

    public function show(Request $request, BankAccount $account): JsonResponse
    {
        $customer = $request->user();

        if ($account->customer_id !== $customer->id) {
            return response()->json([
                'success' => false,
                'message' => 'Account not found',
            ], 404);
        }

        $account->load(['transactions' => function ($query) {
            $query->latest()->limit(20);
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
                'is_primary' => $account->is_primary,
                'transactions' => $account->transactions->map(function ($txn) {
                    return [
                        'id' => $txn->id,
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
}