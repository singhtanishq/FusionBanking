<?php

namespace App\Services;

use App\Models\BankAccount;
use App\Models\Customer;
use App\Models\Transaction;
use App\Enums\AccountStatus;
use App\Enums\TransactionType;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AccountService
{
    public function generateAccountNumber(): string
    {
        do {
            $number = '50' . Str::padLeft((string) random_int(100000000, 999999999), 10, '0');
        } while (BankAccount::where('account_number', $number)->exists());

        return $number;
    }

    public function generateCustomerId(): string
    {
        do {
            $id = 'CUS' . Str::padLeft((string) random_int(1000000, 9999999), 7, '0');
        } while (Customer::where('customer_id', $id)->exists());

        return $id;
    }

    public function generateAcknowledgementNumber(): string
    {
        do {
            $year = now()->year;
            $random = Str::upper(Str::random(8));
            $number = "FBK-{$year}-{$random}";
        } while (\App\Models\Application::where('acknowledgement_number', $number)->exists());

        return $number;
    }

    public function generateTransactionReference(string $prefix = 'TXN'): string
    {
        do {
            $date = now()->format('Ymd');
            $random = Str::upper(Str::random(7));
            $reference = "{$prefix}{$date}{$random}";
        } while (Transaction::where('reference_number', $reference)->exists());

        return $reference;
    }

    public function generateTransferReference(): string
    {
        return $this->generateTransactionReference('TRF');
    }

    public function generateLoanReference(): string
    {
        return $this->generateTransactionReference('LN');
    }

    public function generateFDReference(): string
    {
        return $this->generateTransactionReference('FD');
    }

    public function createInitialDeposit(BankAccount $account, int $amount = 100000): Transaction
    {
        return DB::transaction(function () use ($account, $amount) {
            $transaction = Transaction::create([
                'transaction_id' => $this->generateTransactionReference('TXN'),
                'reference_number' => $this->generateTransactionReference('TXN'),
                'account_id' => $account->id,
                'type' => TransactionType::CASH_DEPOSIT,
                'direction' => 'credit',
                'amount' => $amount,
                'opening_balance' => 0,
                'closing_balance' => $amount,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => 'Initial cash deposit on account opening',
                'completed_at' => now(),
            ]);

            $account->increment('balance', $amount);
            $account->increment('available_balance', $amount);

            return $transaction;
        });
    }

    public function getAvailableBalance(BankAccount $account): float
    {
        return $account->available_balance;
    }

    public function canDebit(BankAccount $account, float $amount): bool
    {
        return $account->canTransact() && $account->available_balance >= $amount;
    }
}