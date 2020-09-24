<?php

namespace App\Services;

use App\Models\FixedDeposit;
use App\Models\FDProduct;
use App\Models\Transaction;
use App\Models\BankAccount;
use App\Enums\FDStatus;
use App\Enums\TransactionType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class FDService
{
    public function calculateMaturityAmount(float $principal, float $annualRate, int $tenureMonths): float
    {
        // Simple interest calculation for demo (quarterly compounding would be more realistic)
        $years = $tenureMonths / 12;
        $interest = $principal * ($annualRate / 100) * $years;
        return round($principal + $interest, 2);
    }

    public function calculateInterest(float $principal, float $annualRate, int $tenureMonths): float
    {
        $maturityAmount = $this->calculateMaturityAmount($principal, $annualRate, $tenureMonths);
        return round($maturityAmount - $principal, 2);
    }

    public function createFixedDeposit(
        \App\Models\Customer $customer,
        BankAccount $account,
        FDProduct $product,
        float $amount,
        int $tenureMonths
    ): FixedDeposit {
        // Validate amount
        if ($amount < $product->min_amount || $amount > $product->max_amount) {
            throw new Exception("FD amount must be between {$product->min_amount} and {$product->max_amount}");
        }

        // Validate tenure
        if ($tenureMonths < $product->min_tenure_months || $tenureMonths > $product->max_tenure_months) {
            throw new Exception("Tenure must be between {$product->min_tenure_months} and {$product->max_tenure_months} months");
        }

        // Check account balance
        if (!$account->canTransact() || $account->available_balance < $amount) {
            throw new Exception('Insufficient balance for FD creation');
        }

        $maturityAmount = $this->calculateMaturityAmount($amount, $product->interest_rate, $tenureMonths);
        $maturityDate = now()->addMonths($tenureMonths)->endOfMonth();

        return DB::transaction(function () use (
            $customer,
            $account,
            $product,
            $amount,
            $tenureMonths,
            $maturityAmount,
            $maturityDate
        ) {
            $fd = FixedDeposit::create([
                'fd_number' => 'FD' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'customer_id' => $customer->id,
                'account_id' => $account->id,
                'fd_product_id' => $product->id,
                'status' => FDStatus::ACTIVE,
                'principal_amount' => $amount,
                'interest_rate' => $product->interest_rate,
                'tenure_months' => $tenureMonths,
                'maturity_amount' => $maturityAmount,
                'maturity_date' => $maturityDate,
                'opened_at' => now(),
            ]);

            // Debit account
            $openingBalance = $account->balance;
            $closingBalance = $openingBalance - $amount;

            $account->decrement('balance', $amount);
            $account->decrement('available_balance', $amount);

            Transaction::create([
                'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'account_id' => $account->id,
                'type' => TransactionType::FD_CREATION,
                'direction' => 'debit',
                'amount' => $amount,
                'opening_balance' => $openingBalance,
                'closing_balance' => $closingBalance,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => "Fixed Deposit created: {$fd->fd_number}",
                'completed_at' => now(),
            ]);

            // Log audit
            \App\Models\AuditLog::log(
                'fd_created',
                'fixed_deposit',
                $fd->id,
                $customer,
                [],
                ['amount' => $amount, 'tenure' => $tenureMonths, 'maturity_amount' => $maturityAmount]
            );

            return $fd;
        });
    }

    public function matureFixedDeposit(FixedDeposit $fd): void
    {
        if ($fd->status !== FDStatus::ACTIVE) {
            throw new Exception('FD is not active');
        }

        if (!$fd->isMatured()) {
            throw new Exception('FD has not matured yet');
        }

        DB::transaction(function () use ($fd) {
            $account = $fd->account()->lockForUpdate()->first();
            
            if (!$account->canTransact()) {
                throw new Exception('Account is not active');
            }

            $openingBalance = $account->balance;
            $closingBalance = $openingBalance + $fd->maturity_amount;

            $account->increment('balance', $fd->maturity_amount);
            $account->increment('available_balance', $fd->maturity_amount);

            Transaction::create([
                'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'account_id' => $account->id,
                'type' => TransactionType::FD_MATURITY,
                'direction' => 'credit',
                'amount' => $fd->maturity_amount,
                'opening_balance' => $openingBalance,
                'closing_balance' => $closingBalance,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => "FD maturity: {$fd->fd_number}",
                'completed_at' => now(),
            ]);

            $fd->update([
                'status' => FDStatus::MATURED,
                'matured_at' => now(),
            ]);

            // Log audit
            \App\Models\AuditLog::log(
                'fd_matured',
                'fixed_deposit',
                $fd->id,
                $fd->customer,
                ['status' => FDStatus::ACTIVE->value],
                ['status' => FDStatus::MATURED->value, 'maturity_amount' => $fd->maturity_amount]
            );
        });
    }

    public function prematureClose(FixedDeposit $fd, \App\Models\Admin $admin): void
    {
        if ($fd->status !== FDStatus::ACTIVE) {
            throw new Exception('FD is not active');
        }

        // For premature closure, we might apply a penalty (e.g., 1% of principal)
        $penaltyRate = 0.01; // 1%
        $penalty = round($fd->principal_amount * $penaltyRate, 2);
        $refundAmount = $fd->principal_amount - $penalty;

        DB::transaction(function () use ($fd, $admin, $refundAmount, $penalty) {
            $account = $fd->account()->lockForUpdate()->first();
            
            if (!$account->canTransact()) {
                throw new Exception('Account is not active');
            }

            $openingBalance = $account->balance;
            $closingBalance = $openingBalance + $refundAmount;

            $account->increment('balance', $refundAmount);
            $account->increment('available_balance', $refundAmount);

            Transaction::create([
                'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'account_id' => $account->id,
                'type' => TransactionType::FD_CREATION, // Using FD_CREATION type for refund
                'direction' => 'credit',
                'amount' => $refundAmount,
                'opening_balance' => $openingBalance,
                'closing_balance' => $closingBalance,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => "Premature FD closure: {$fd->fd_number} (Penalty: ₹{$penalty})",
                'completed_at' => now(),
            ]);

            $fd->update([
                'status' => FDStatus::PREMATURE_CLOSED,
                'closed_at' => now(),
                'closed_by' => $admin->id,
            ]);

            // Log audit
            \App\Models\AuditLog::log(
                'fd_premature_closed',
                'fixed_deposit',
                $fd->id,
                $admin,
                ['status' => FDStatus::ACTIVE->value],
                ['status' => FDStatus::PREMATURE_CLOSED->value, 'refund_amount' => $refundAmount, 'penalty' => $penalty]
            );
        });
    }
}