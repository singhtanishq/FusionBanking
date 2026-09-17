<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\BankAccount;
use App\Services\LedgerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    protected LedgerService $ledgerService;

    public function __construct(LedgerService $ledgerService)
    {
        $this->ledgerService = $ledgerService;
    }

    public function adjust(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'account_id' => 'required|exists:bank_accounts,id',
            'amount' => 'required|numeric|not_in:0',
            'description' => 'required|string|min:5|max:500',
            'reference' => 'nullable|string|max:64',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $account = BankAccount::findOrFail($request->account_id);

        try {
            $transaction = $this->ledgerService->createAdjustment(
                $account,
                $request->amount,
                $request->description,
                $request->reference
            );

            \App\Models\AuditLog::log(
                'transaction_adjusted',
                'transaction',
                $transaction->id,
                $request->user(),
                [],
                [
                    'account_id' => $account->id,
                    'amount' => $request->amount,
                    'description' => $request->description,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Adjustment created successfully',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'reference_number' => $transaction->reference_number,
                    'amount' => $transaction->amount,
                    'direction' => $transaction->direction,
                    'closing_balance' => $transaction->closing_balance,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function reverse(Request $request, Transaction $transaction): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|min:5|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a reason for reversal.',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($transaction->status === 'reversed') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction already reversed',
            ], 422);
        }

        try {
            $reversal = $this->ledgerService->reverseTransaction(
                $transaction,
                $request->user(),
                $request->reason
            );

            return response()->json([
                'success' => true,
                'message' => 'Transaction reversed successfully',
                'data' => [
                    'reversal_id' => $reversal->id,
                    'reversal_reference' => $reversal->reference_number,
                    'amount' => $reversal->amount,
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