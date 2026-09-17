<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Transaction::with(['account.customer', 'relatedAccount', 'transfer'])
            ->latest();

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('reference_number', 'like', "%{$request->search}%")
                  ->orWhereHas('account.customer', function ($q) use ($request) {
                      $q->where('full_name', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('direction') && $request->direction) {
            $query->where('direction', $request->direction);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $transactions = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $transactions->map(function ($txn) {
                return [
                    'id' => $txn->id,
                    'reference_number' => $txn->reference_number,
                    'type' => $txn->type->value,
                    'direction' => $txn->direction,
                    'amount' => $txn->amount,
                    'description' => $txn->description,
                    'status' => $txn->status,
                    'created_at' => $txn->created_at?->toISOString(),
                    'completed_at' => $txn->completed_at?->toISOString(),
                    'opening_balance' => $txn->opening_balance,
                    'closing_balance' => $txn->closing_balance,
                    'account' => $txn->account ? [
                        'account_number' => $txn->account->getMaskedAccountNumber(),
                        'customer_name' => $txn->account->customer->full_name ?? null,
                    ] : null,
                    'related_account' => $txn->relatedAccount ? [
                        'account_number' => $txn->relatedAccount->getMaskedAccountNumber(),
                        'customer_name' => $txn->relatedAccount->customer->full_name ?? null,
                    ] : null,
                ];
            }),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        $transaction->load(['account.customer', 'relatedAccount', 'transfer']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $transaction->id,
                'reference_number' => $transaction->reference_number,
                'type' => $transaction->type->value,
                'direction' => $transaction->direction,
                'amount' => $transaction->amount,
                'description' => $transaction->description,
                'status' => $transaction->status,
                'created_at' => $transaction->created_at?->toISOString(),
                'completed_at' => $transaction->completed_at?->toISOString(),
                'opening_balance' => $transaction->opening_balance,
                'closing_balance' => $transaction->closing_balance,
                'currency' => $transaction->currency,
                'description' => $transaction->description,
                'account' => $transaction->account ? [
                    'account_number' => $transaction->account->getMaskedAccountNumber(),
                    'customer_name' => $transaction->account->customer->full_name ?? null,
                ] : null,
                'related_account' => $transaction->relatedAccount ? [
                    'account_number' => $transaction->relatedAccount->getMaskedAccountNumber(),
                    'customer_name' => $transaction->relatedAccount->customer->full_name ?? null,
                ] : null,
                'transfer' => $transaction->transfer ? [
                    'reference_number' => $transaction->transfer->reference_number,
                    'status' => $transaction->transfer->status->value,
                ] : null,
                'metadata' => $transaction->metadata,
            ],
        ]);
    }
}