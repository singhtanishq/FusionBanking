<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Services\LedgerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReconciliationController extends Controller
{
    protected LedgerService $ledgerService;

    public function __construct(LedgerService $ledgerService)
    {
        $this->ledgerService = $ledgerService;
    }

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = BankAccount::query();

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('account_number', 'like', "%{$request->search}%")
                  ->orWhereHas('customer', function ($q) use ($request) {
                      $q->where('full_name', 'like', "%{$request->search}%");
                  });
            });
        }

        $accounts = $query->paginate($request->get('per_page', 20));

        // Get reconciliation status for each account
        $accounts->getCollection()->transform(function ($account) {
            $reconciliation = $this->ledgerService->reconcileAccount($account);
            $account->reconciliation = $reconciliation;
            return $account;
        });

        return response()->json([
            'success' => true,
            'data' => $accounts->map(function ($account) {
                return [
                    'id' => $account->id,
                    'account_number' => $account->getMaskedAccountNumber(),
                    'customer_name' => $account->customer?->full_name,
                    'status' => $account->status->value,
                    'stored_balance' => $account->balance,
                    'ledger_balance' => $account->reconciliation['ledger_balance'] ?? null,
                    'difference' => $account->reconciliation['difference'] ?? null,
                    'is_reconciled' => $account->reconciliation['is_reconciled'] ?? false,
                    'opening_date' => $account->opening_date?->toDateString(),
                    'status' => $account->status->value,
                ];
            }),
            'pagination' => [
                'current_page' => $accounts->currentPage(),
                'last_page' => $accounts->lastPage(),
                'total' => $accounts->total(),
            ],
        ]);
    }

    public function run(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'account_ids' => 'sometimes|array',
            'account_ids.*' => 'exists:bank_accounts,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide valid account IDs.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $query = BankAccount::query();

        if ($request->has('account_ids') && $request->account_ids) {
            $query->whereIn('id', $request->account_ids);
        }

        $accounts = $query->get();
        $results = [];
        $discrepancies = 0;

        foreach ($accounts as $account) {
            $reconciliation = $this->ledgerService->reconcileAccount($account);
            $results[] = [
                'account_id' => $account->id,
                'account_number' => $account->getMaskedAccountNumber(),
                'stored_balance' => $reconciliation['stored_balance'],
                'ledger_balance' => $reconciliation['ledger_balance'],
                'difference' => $reconciliation['difference'],
                'is_reconciled' => $reconciliation['is_reconciled'],
            ];

            if (!$reconciliation['is_reconciled']) {
                $discrepancies++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Reconciliation completed. {$discrepancies} account(s) with discrepancies found.",
            'data' => [
                'total_accounts_checked' => count($results),
                'discrepancies_found' => $discrepancies,
                'results' => $results,
            ],
        ]);
    }
}