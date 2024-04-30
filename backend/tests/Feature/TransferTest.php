<?php

use App\Models\Customer;
use App\Models\BankAccount;
use App\Models\Transfer;
use App\Services\TransferService;
use Illuminate\Support\Facades\DB;
use function Pest\Laravel\seed;

test('transfer between two accounts works correctly', function () {
    seed('DatabaseSeeder');
    seed('DemoDataSeeder');

    $sender = Customer::where('customer_id', 'CUS1000001')->first();
    $receiver = Customer::where('customer_id', 'CUS1000002')->first();

    $senderAccount = $sender->primaryAccount;
    $receiverAccount = $receiver->primaryAccount;

    $initialSenderBalance = $senderAccount->balance;
    $initialReceiverBalance = $receiverAccount->balance;
    $transferAmount = 10000;

    $transferService = new TransferService();
    
    // Initiate transfer
    $transfer = $transferService->initiateTransfer(
        $sender,
        $senderAccount,
        $receiverAccount->account_number,
        $receiverAccount->ifsc_code,
        $transferAmount,
        'Test transfer'
    );

    expect($transfer)->toBeInstanceOf(Transfer::class);
    expect($transfer->status)->toBe(\App\Enums\TransferStatus::PENDING_VERIFICATION);
    expect($transfer->amount)->toBe($transferAmount);

    // Get the verification token
    $verificationToken = \App\Models\VerificationToken::where('resource_type', Transfer::class)
        ->where('resource_id', $transfer->id)
        ->where('purpose', \App\Enums\VerificationPurpose::TRANSFER_VERIFICATION)
        ->first();

    expect($verificationToken)->not->toBeNull();

    // Execute transfer with the token
    $token = 'TEST_TOKEN'; // We can't easily test the actual token, but we can test the logic
    // For this test, we'll directly test the execute logic with a mock token
    
    // Create a valid token for testing
    $testToken = \App\Models\VerificationToken::generateToken(16);
    $tokenHash = \App\Models\VerificationToken::hashToken($testToken);
    
    $verificationToken->update([
        'token_hash' => $tokenHash,
        'is_used' => false,
        'is_revoked' => false,
        'attempts' => 0,
    ]);

    $transferService->executeTransfer($transfer, $testToken);

    // Refresh accounts
    $senderAccount->refresh();
    $receiverAccount->refresh();

    // Verify balances
    expect($senderAccount->balance)->toBe($initialSenderBalance - $transferAmount);
    expect($receiverAccount->balance)->toBe($initialReceiverBalance + $transferAmount);

    // Verify transfer status
    $transfer->refresh();
    expect($transfer->status)->toBe(\App\Enums\TransferStatus::COMPLETED);

    // Verify transactions created
    $senderTransactions = Transaction::where('account_id', $senderAccount->id)
        ->where('transfer_id', $transfer->id)
        ->get();
    $receiverTransactions = Transaction::where('account_id', $receiverAccount->id)
        ->where('transfer_id', $transfer->id)
        ->get();

    expect($senderTransactions)->toHaveCount(1);
    expect($receiverTransactions)->toHaveCount(1);

    $senderTxn = $senderTransactions->first();
    $receiverTxn = $receiverTransactions->first();

    expect($senderTxn->type)->toBe(\App\Enums\TransactionType::MONEY_SENT);
    expect($senderTxn->direction)->toBe('debit');
    expect($senderTxn->amount)->toBe($transferAmount);

    expect($receiverTxn->type)->toBe(\App\Enums\TransactionType::MONEY_RECEIVED);
    expect($receiverTxn->direction)->toBe('credit');
    expect($receiverTxn->amount)->toBe($transferAmount);
});

test('transfer with insufficient balance fails', function () {
    seed('DatabaseSeeder');
    seed('DemoDataSeeder');

    $sender = Customer::where('customer_id', 'CUS1000001')->first();
    $receiver = Customer::where('customer_id', 'CUS1000002')->first();
    
    $senderAccount = $sender->primaryAccount;
    $receiverAccount = $receiver->primaryAccount;

    $transferService = new TransferService();

    // Try to transfer more than balance
    $transferService->initiateTransfer(
        $sender,
        $senderAccount,
        $receiverAccount->account_number,
        $receiverAccount->ifsc_code,
        $senderAccount->balance + 1000,
        'Test transfer'
    );
})->throws(\Exception::class, 'Insufficient balance');

test('transfer to non-existent account fails', function () {
    seed('DatabaseSeeder');
    seed('DemoDataSeeder');

    $sender = Customer::where('customer_id', 'CUS1000001')->first();
    $senderAccount = $sender->primaryAccount;

    $transferService = new TransferService();

    $transferService->initiateTransfer(
        $sender,
        $senderAccount,
        '999999999999',
        'FUSB0001001',
        10000,
        'Test transfer'
    );
})->throws(\Exception::class, 'Recipient account not found or not eligible to receive transfers');

test('transfer to self fails', function () {
    seed('DatabaseSeeder');
    seed('DemoDataSeeder');

    $sender = Customer::where('customer_id', 'CUS1000001')->first();
    $senderAccount = $sender->primaryAccount;

    $transferService = new TransferService();

    $transferService->initiateTransfer(
        $sender,
        $senderAccount,
        $senderAccount->account_number,
        $senderAccount->ifsc_code,
        10000,
        'Test transfer'
    );
})->throws(\Exception::class, 'Cannot transfer to your own account');

test('concurrent transfers from same account are handled correctly', function () {
    seed('DatabaseSeeder');
    seed('DemoDataSeeder');

    $sender = Customer::where('customer_id', 'CUS1000001')->first();
    $receiver1 = Customer::where('customer_id', 'CUS1000002')->first();
    $receiver2 = Customer::where('customer_id', 'CUS1000003')->first();
    
    $senderAccount = $sender->primaryAccount;
    $receiverAccount1 = $receiver1->primaryAccount;
    $receiverAccount2 = $receiver2->primaryAccount;

    $initialBalance = $senderAccount->balance;
    $transferAmount = 80000;

    $transferService = new TransferService();

    // Initiate two transfers
    $transfer1 = $transferService->initiateTransfer(
        $sender,
        $senderAccount,
        $receiverAccount1->account_number,
        $receiverAccount1->ifsc_code,
        $transferAmount,
        'Transfer 1'
    );

    $transfer2 = $transferService->initiateTransfer(
        $sender,
        $senderAccount,
        $receiverAccount2->account_number,
        $receiverAccount2->ifsc_code,
        $transferAmount,
        'Transfer 2'
    );

    // Get tokens for both transfers
    $token1 = \App\Models\VerificationToken::generateToken(16);
    $tokenHash1 = \App\Models\VerificationToken::hashToken($token1);
    
    $token2 = \App\Models\VerificationToken::generateToken(16);
    $tokenHash2 = \App\Models\VerificationToken::hashToken($token2);

    \App\Models\VerificationToken::where('resource_type', Transfer::class)
        ->where('resource_id', $transfer1->id)
        ->update(['token_hash' => $tokenHash1, 'is_used' => false, 'is_revoked' => false, 'attempts' => 0]);

    \App\Models\VerificationToken::where('resource_type', Transfer::class)
        ->where('resource_id', $transfer2->id)
        ->update(['token_hash' => $tokenHash2, 'is_used' => false, 'is_revoked' => false, 'attempts' => 0]);

    // Execute first transfer
    $transferService->executeTransfer($transfer1, $token1);

    // Try to execute second transfer - should fail due to insufficient balance
    try {
        $transferService->executeTransfer($transfer2, $token2);
        $secondSucceeded = true;
    } catch (\Exception $e) {
        $secondSucceeded = false;
    }

    $senderAccount->refresh();
    $receiverAccount1->refresh();
    $receiverAccount2->refresh();

    // Only one transfer should succeed
    $successfulTransfers = 0;
    if ($transfer1->fresh()->status === \App\Enums\TransferStatus::COMPLETED) $successfulTransfers++;
    if ($transfer2->fresh()->status === \App\Enums\TransferStatus::COMPLETED) $successfulTransfers++;

    expect($successfulTransfers)->toBe(1);
    expect($senderAccount->balance)->toBeGreaterThanOrEqual(0);
});