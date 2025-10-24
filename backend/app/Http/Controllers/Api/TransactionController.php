<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customer = $request->user();
        $accountIds = $customer->accounts()->pluck('id');

        $query = Transaction::whereIn('account_id', $accountIds)
            ->with(['relatedAccount', 'transfer'])
            ->latest();

        // Filters
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

        if ($request->has('search') && $request->search) {
            $query->where('reference_number', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%");
        }

        if ($request->has('min_amount') && $request->min_amount) {
            $query->where('amount', '>=', $request->min_amount);
        }

        if ($request->has('max_amount') && $request->max_amount) {
            $query->where('amount', '<=', $request->max_amount);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('account_id') && $request->account_id) {
            $query->where('account_id', $request->account_id);
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
                    'currency' => $txn->currency,
                    'account' => $txn->account ? [
                        'account_number' => $txn->account->getMaskedAccountNumber(),
                        'customer_name' => $txn->account->customer->full_name ?? null,
                    ] : null,
                    'related_account' => $txn->relatedAccount ? [
                        'account_number' => $txn->relatedAccount->getMaskedAccountNumber(),
                        'customer_name' => $txn->relatedAccount->customer->full_name ?? null,
                    ] : null,
                    'transfer_reference' => $txn->transfer?->reference_number,
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
        $customer = $request->user();
        $accountIds = $customer->accounts()->pluck('id');

        if (!$accountIds->contains($transaction->account_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found',
            ], 404);
        }

        $transaction->load(['relatedAccount', 'transfer', 'account']);

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
                'account' => $transaction->account ? [
                    'account_number' => $transaction->account->getMaskedAccountNumber(),
                    'customer_name' => $transaction->account->customer->full_name ?? null,
                ] : null,
                'related_account' => $transaction->relatedAccount ? [
                    'account_number' => $transaction->relatedAccount->getMaskedAccountNumber(),
                    'customer_name' => $transaction->relatedAccount->customer->full_name ?? null,
                ] : null,
                'transfer_reference' => $transaction->transfer?->reference_number,
            ],
        ]);
    }

    public function statement(Request $request): JsonResponse
    {
        $customer = $request->user();
        $accountIds = $customer->accounts()->pluck('id');

        $query = Transaction::whereIn('account_id', $accountIds)
            ->with(['relatedAccount', 'transfer'])
            ->latest();

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $transactions = $query->get();

        // Calculate summary
        $totalCredits = $transactions->where('direction', 'credit')->sum('amount');
        $totalDebits = $transactions->where('direction', 'debit')->sum('amount');
        $netFlow = $totalCredits - $totalDebits;

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_transactions' => $transactions->count(),
                    'total_credits' => $totalCredits,
                    'total_debits' => $totalDebits,
                    'net_flow' => $netFlow,
                    'period_start' => $request->date_from ?? $transactions->min('created_at')?->toDateString(),
                    'period_end' => $request->date_to ?? $transactions->max('created_at')?->toDateString(),
                ],
                'transactions' => $transactions->map(function ($txn) {
                    return [
                        'date' => $txn->created_at?->toDateString(),
                        'time' => $txn->created_at?->format('H:i:s'),
                        'reference' => $txn->reference_number,
                        'type' => $txn->type->value,
                        'direction' => $txn->direction,
                        'amount' => $txn->amount,
                        'description' => $txn->description,
                        'balance' => $txn->closing_balance,
                        'status' => $txn->status,
                    ];
                }),
            ],
        ]);
    }

    public function downloadStatement(Request $request): Response
    {
        $customer = $request->user();
        $accountIds = $customer->accounts()->pluck('id');

        $query = Transaction::whereIn('account_id', $accountIds)
            ->latest();

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->get();

        $csvData = "Date,Time,Reference,Type,Direction,Amount,Description,Balance,Status\n";

        foreach ($transactions as $txn) {
            $csvData .= sprintf(
                "%s,%s,%s,%s,%s,%.2f,%s,%.2f,%s\n",
                $txn->created_at?->toDateString(),
                $txn->created_at?->format('H:i:s'),
                $txn->reference_number,
                $txn->type->value,
                $txn->direction,
                $txn->amount,
                str_replace(',', ';', $txn->description ?? ''),
                $txn->closing_balance,
                $txn->status
            );
        }

        $filename = 'statement_' . $customer->customer_id . '_' . now()->format('YmdHis') . '.csv';

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }
}
