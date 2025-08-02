<?php

namespace App\Services;

use App\Models\BankAccount;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\VerificationToken;
use App\Enums\AccountStatus;
use App\Enums\TransferStatus;
use App\Enums\TransactionType;
use App\Enums\VerificationPurpose;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class TransferService
{
    private const MAX_DAILY_TRANSFER_LIMIT = 500000;
    private const MAX_SINGLE_TRANSFER_LIMIT = 200000;
    private const OTP_EXPIRY_MINUTES = 10;

    public function initiateTransfer(
        Customer $sender,
        BankAccount $senderAccount,
        string $receiverAccountNumber,
        string $receiverIfsc,
        float $amount,
        string $remark = '',
        string $idempotencyKey = null
    ): Transfer {
        // Validate sender account
        if (!$senderAccount->canTransact()) {
            throw new Exception('Sender account is not active');
        }

        if (!$this->canDebit($senderAccount, $amount)) {
            throw new Exception('Insufficient balance');
        }

        // Find receiver account
        $receiverAccount = BankAccount::where('account_number', $receiverAccountNumber)
            ->where('ifsc_code', $receiverIfsc)
            ->where('status', AccountStatus::ACTIVE)
            ->first();

        if (!$receiverAccount) {
            throw new Exception('Recipient account not found or not eligible to receive transfers');
        }

        if ($senderAccount->id === $receiverAccount->id) {
            throw new Exception('Cannot transfer to your own account');
        }

        $receiverCustomer = $receiverAccount->customer;

        // Validate transfer limits
        $this->validateTransferLimits($sender, $amount);

        // Calculate fee (free for internal transfers)
        $fee = 0;
        $totalDebit = $amount + $fee;

        if (!$this->canDebit($senderAccount, $totalDebit)) {
            throw new Exception('Insufficient balance including fees');
        }

        // Create transfer record
        $transfer = DB::transaction(function () use (
            $sender,
            $senderAccount,
            $receiverAccount,
            $receiverCustomer,
            $amount,
            $fee,
            $totalDebit,
            $remark,
            $idempotencyKey
        ) {
            $transfer = Transfer::create([
                'transfer_id' => 'TRF' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => $this->generateTransferReference(),
                'sender_account_id' => $senderAccount->id,
                'receiver_account_id' => $receiverAccount->id,
                'sender_customer_id' => $sender->id,
                'receiver_customer_id' => $receiverCustomer->id,
                'amount' => $amount,
                'fee' => $fee,
                'total_debit' => $totalDebit,
                'transfer_type' => 'internal',
                'remark' => $remark,
                'status' => TransferStatus::PENDING_VERIFICATION,
                'idempotency_key' => $idempotencyKey ?? Str::uuid()->toString(),
            ]);

            return $transfer;
        });

        // Create and send verification token
        $this->createTransferVerificationToken($transfer);

        return $transfer;
    }

    public function executeTransfer(Transfer $transfer, string $token): void
    {
        // Validate token
        $verificationToken = VerificationToken::where('token_hash', VerificationToken::hashToken($token))
            ->where('purpose', VerificationPurpose::TRANSFER_VERIFICATION)
            ->where('resource_type', Transfer::class)
            ->where('resource_id', $transfer->id)
            ->first();

        if (!$verificationToken || !$verificationToken->isValid()) {
            $verificationToken?->incrementAttempts();
            throw new Exception('Invalid or expired verification token');
        }

        DB::transaction(function () use ($transfer, $verificationToken) {
            // Re-validate accounts and balances
            $senderAccount = $transfer->senderAccount()->lockForUpdate()->first();
            $receiverAccount = $transfer->receiverAccount()->lockForUpdate()->first();

            if (!$senderAccount->canTransact() || !$receiverAccount->canTransact()) {
                throw new Exception('One or both accounts are not active');
            }

            if (!$this->canDebit($senderAccount, $transfer->total_debit)) {
                throw new Exception('Insufficient balance at time of execution');
            }

            // Update transfer status
            $transfer->update([
                'status' => TransferStatus::PROCESSING,
                'verified_at' => now(),
                'verification_token_id' => $verificationToken->id,
            ]);

            $verificationToken->markAsUsed();

            // Debit sender
            $senderOpeningBalance = $senderAccount->balance;
            $senderClosingBalance = $senderOpeningBalance - $transfer->total_debit;

            $senderAccount->decrement('balance', $transfer->total_debit);
            $senderAccount->decrement('available_balance', $transfer->total_debit);

            Transaction::create([
                'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => $this->generateTransactionReference('TXN'),
                'account_id' => $senderAccount->id,
                'related_account_id' => $receiverAccount->id,
                'transfer_id' => $transfer->id,
                'type' => TransactionType::MONEY_SENT,
                'direction' => 'debit',
                'amount' => $transfer->amount,
                'opening_balance' => $senderOpeningBalance,
                'closing_balance' => $senderClosingBalance,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => "Transfer to {$transfer->receiverCustomer->full_name} ({$transfer->receiverAccount->getMaskedAccountNumber()}) - {$transfer->remark}",
                'completed_at' => now(),
            ]);

            // Credit receiver
            $receiverOpeningBalance = $receiverAccount->balance;
            $receiverClosingBalance = $receiverOpeningBalance + $transfer->amount;

            $receiverAccount->increment('balance', $transfer->amount);
            $receiverAccount->increment('available_balance', $transfer->amount);

            Transaction::create([
                'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => $this->generateTransactionReference('TXN'),
                'account_id' => $receiverAccount->id,
                'related_account_id' => $senderAccount->id,
                'transfer_id' => $transfer->id,
                'type' => TransactionType::MONEY_RECEIVED,
                'direction' => 'credit',
                'amount' => $transfer->amount,
                'opening_balance' => $receiverOpeningBalance,
                'closing_balance' => $receiverClosingBalance,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => "Transfer from {$transfer->senderCustomer->full_name} ({$transfer->senderAccount->getMaskedAccountNumber()}) - {$transfer->remark}",
                'completed_at' => now(),
            ]);

            // Update transfer as completed
            $transfer->update([
                'status' => TransferStatus::COMPLETED,
                'processed_at' => now(),
            ]);

            // Log audit
            \App\Models\AuditLog::log(
                'transfer_completed',
                'transfer',
                $transfer->id,
                $transfer->senderCustomer,
                [],
                ['status' => TransferStatus::COMPLETED->value],
                ['amount' => $transfer->amount]
            );
        });
    }

    public function validateRecipient(string $accountNumber, string $ifsc): ?BankAccount
    {
        return BankAccount::where('account_number', $accountNumber)
            ->where('ifsc_code', $ifsc)
            ->where('status', AccountStatus::ACTIVE)
            ->with('customer')
            ->first();
    }

    private function canDebit(BankAccount $account, float $amount): bool
    {
        return $account->canTransact() && $account->available_balance >= $amount;
    }

    private function validateTransferLimits(Customer $customer, float $amount): void
    {
        $dailyLimit = (float) \App\Models\SystemSetting::get('transfer_daily_limit', self::MAX_DAILY_TRANSFER_LIMIT);
        $singleLimit = (float) \App\Models\SystemSetting::get('transfer_single_limit', self::MAX_SINGLE_TRANSFER_LIMIT);

        if ($amount > $singleLimit) {
            throw new Exception("Transfer amount exceeds single transaction limit of ₹{$singleLimit}");
        }

        $todayTransfers = Transfer::where('sender_customer_id', $customer->id)
            ->where('status', TransferStatus::COMPLETED)
            ->whereDate('created_at', today())
            ->sum('amount');

        if (($todayTransfers + $amount) > $dailyLimit) {
            throw new Exception("Daily transfer limit of ₹{$dailyLimit} exceeded");
        }
    }

    private function createTransferVerificationToken(Transfer $transfer): void
    {
        $token = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $tokenHash = VerificationToken::hashToken($token);
        $expiryMinutes = (int) \App\Models\SystemSetting::get('otp_expiry_minutes', self::OTP_EXPIRY_MINUTES);
        $maxAttempts = (int) \App\Models\SystemSetting::get('max_otp_attempts', 3);

        VerificationToken::create([
            'token_hash' => $tokenHash,
            'customer_id' => $transfer->sender_customer_id,
            'purpose' => VerificationPurpose::TRANSFER_VERIFICATION,
            'resource_type' => Transfer::class,
            'resource_id' => $transfer->id,
            'expires_at' => now()->addMinutes($expiryMinutes),
            'max_attempts' => $maxAttempts,
        ]);

        // Send email with token
        $transfer->senderCustomer->notify(new \App\Notifications\TransferVerificationNotification($transfer, $token));
    }

    private function generateTransferReference(): string
    {
        do {
            $date = now()->format('Ymd');
            $random = Str::upper(Str::random(7));
            $reference = "TRF{$date}{$random}";
        } while (Transfer::where('reference_number', $reference)->exists());

        return $reference;
    }

    private function generateTransactionReference(string $prefix = 'TXN'): string
    {
        do {
            $date = now()->format('Ymd');
            $random = Str::upper(Str::random(7));
            $reference = "{$prefix}{$date}{$random}";
        } while (Transaction::where('reference_number', $reference)->exists());

        return $reference;
    }
}