<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\BankAccount;
use App\Models\Transaction;
use App\Enums\TransactionType;
use App\Enums\AccountStatus;
use Illuminate\Support\Facades\DB;
use Exception;

class LedgerService
{
    public function getBalance(BankAccount $account): float
    {
        // Calculate balance from transaction ledger
        $balance = Transaction::where('account_id', $account->id)
            ->where('status', 'completed')
            ->sum('amount');
        
        return $balance;
    }

    public function reconcileAccount(BankAccount $account): array
    {
        $ledgerBalance = $this->getBalance($account);
        $storedBalance = $account->balance;
        $difference = $ledgerBalance - $storedBalance;

        return [
            'account_id' => $account->id,
            'account_number' => $account->account_number,
            'ledger_balance' => $ledgerBalance,
            'stored_balance' => $storedBalance,
            'difference' => $difference,
            'is_reconciled' => abs($difference) < 0.01,
        ];
    }

    public function createAdjustment(
        BankAccount $account,
        float $amount,
        string $description,
        string $reference = null
    ): Transaction {
        $direction = $amount >= 0 ? 'credit' : 'debit';
        $amount = abs($amount);

        return DB::transaction(function () use ($account, $amount, $direction, $description, $reference) {
            $openingBalance = $account->balance;
            $closingBalance = $direction === 'credit' 
                ? $openingBalance + $amount 
                : $openingBalance - $amount;

            if ($direction === 'debit' && $closingBalance < 0) {
                throw new Exception('Adjustment would result in negative balance');
            }

            $account->balance = $closingBalance;
            $account->available_balance = $closingBalance;
            $account->save();

            return Transaction::create([
                'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => $reference ?? 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'account_id' => $account->id,
                'type' => TransactionType::ADJUSTMENT,
                'direction' => $direction,
                'amount' => $amount,
                'opening_balance' => $openingBalance,
                'closing_balance' => $closingBalance,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => $description,
                'completed_at' => now(),
            ]);
        });
    }

    public function reverseTransaction(Transaction $originalTransaction, \App\Models\Admin $admin, string $reason): Transaction
    {
        if ($originalTransaction->status === 'reversed') {
            throw new Exception('Transaction already reversed');
        }

        return DB::transaction(function () use ($originalTransaction, $admin, $reason) {
            $account = $originalTransaction->account()->lockForUpdate()->first();
            
            $reversalAmount = $originalTransaction->amount;
            $reversalDirection = $originalTransaction->direction === 'credit' ? 'debit' : 'credit';

            $openingBalance = $account->balance;
            $closingBalance = $reversalDirection === 'credit' 
                ? $openingBalance + $reversalAmount 
                : $openingBalance - $reversalAmount;

            if ($reversalDirection === 'debit' && $closingBalance < 0) {
                throw new Exception('Reversal would result in negative balance');
            }

            $account->balance = $closingBalance;
            $account->available_balance = $closingBalance;
            $account->save();

            $reversal = Transaction::create([
                'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'account_id' => $account->id,
                'related_account_id' => $originalTransaction->related_account_id,
                'type' => TransactionType::REVERSAL,
                'direction' => $reversalDirection,
                'amount' => $reversalAmount,
                'opening_balance' => $openingBalance,
                'closing_balance' => $closingBalance,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => "Reversal of {$originalTransaction->reference_number}: {$reason}",
                'completed_at' => now(),
                'metadata' => [
                    'reversed_transaction_id' => $originalTransaction->id,
                    'reversed_reference' => $originalTransaction->reference_number,
                    'reversed_by' => $admin->id,
                ],
            ]);

            $originalTransaction->update(['status' => 'reversed']);

            // Log audit
            \App\Models\AuditLog::log(
                'transaction_reversed',
                'transaction',
                $originalTransaction->id,
                $admin,
                ['status' => 'completed'],
                ['status' => 'reversed', 'reversal_id' => $reversal->id, 'reason' => $reason]
            );

            return $reversal;
        });
    }

    public function getTransactionHistory(BankAccount $account, array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $query = Transaction::where('account_id', $account->id)
            ->with('relatedAccount', 'transfer')
            ->orderByDesc('created_at');

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['direction'])) {
            $query->where('direction', $filters['direction']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['reference'])) {
            $query->where('reference_number', 'like', "%{$filters['reference']}%");
        }

        if (!empty($filters['min_amount'])) {
            $query->where('amount', '>=', $filters['min_amount']);
        }

        if (!empty($filters['max_amount'])) {
            $query->where('amount', '<=', $filters['max_amount']);
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }
}