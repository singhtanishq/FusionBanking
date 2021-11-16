<?php

use App\Services\AccountService;
use App\Models\Customer;
use App\Models\BankAccount;
use App\Enums\AccountStatus;
use function Pest\Laravel\seed;

test('account number generation produces unique numbers', function () {
    $service = new AccountService();
    
    $numbers = [];
    for ($i = 0; $i < 100; $i++) {
        $numbers[] = $service->generateAccountNumber();
    }
    
    expect($numbers)->toHaveCount(100);
    expect(array_unique($numbers))->toHaveCount(100);
    
    // Check format: 50 + 10 digits = 12 digits
    foreach ($numbers as $number) {
        expect($number)->toMatch('/^50\d{10}$/');
    }
});

test('customer id generation produces unique ids', function () {
    $service = new AccountService();
    
    $ids = [];
    for ($i = 0; $i < 100; $i++) {
        $ids[] = $service->generateCustomerId();
    }
    
    expect($ids)->toHaveCount(100);
    expect(array_unique($ids))->toHaveCount(100);
    
    // Check format: CUS + 7 digits
    foreach ($ids as $id) {
        expect($id)->toMatch('/^CUS\d{7}$/');
    }
});

test('acknowledgement number generation produces unique numbers', function () {
    $service = new AccountService();
    
    $numbers = [];
    for ($i = 0; $i < 100; $i++) {
        $numbers[] = $service->generateAcknowledgementNumber();
    }
    
    expect($numbers)->toHaveCount(100);
    expect(array_unique($numbers))->toHaveCount(100);
    
    // Check format: FBK-YEAR-8CHAR
    foreach ($numbers as $number) {
        expect($number)->toMatch('/^FBK-\d{4}-[A-Z0-9]{8}$/');
    }
});

test('initial deposit creates proper transaction and updates balance', function () {
    seed('DatabaseSeeder');
    
    $customer = Customer::factory()->create([
        'customer_id' => 'CUS' . rand(1000000, 9999999),
    ]);
    
    $account = BankAccount::factory()->create([
        'customer_id' => $customer->id,
        'balance' => 0,
        'available_balance' => 0,
        'status' => AccountStatus::ACTIVE,
    ]);
    
    $service = new AccountService();
    $transaction = $service->createInitialDeposit($account, 100000);
    
    expect($transaction)->not->toBeNull();
    expect($transaction->type)->toBe(\App\Enums\TransactionType::CASH_DEPOSIT);
    expect($transaction->direction)->toBe('credit');
    expect($transaction->amount)->toBe(100000);
    expect($transaction->opening_balance)->toBe(0);
    expect($transaction->closing_balance)->toBe(100000);
    expect($transaction->status)->toBe('completed');
    
    $account->refresh();
    expect($account->balance)->toBe(100000);
    expect($account->available_balance)->toBe(100000);
});

test('transaction reference generation produces unique references', function () {
    $service = new AccountService();
    
    $refs = [];
    for ($i = 0; $i < 100; $i++) {
        $refs[] = $service->generateTransactionReference('TXN');
    }
    
    expect($refs)->toHaveCount(100);
    expect(array_unique($refs))->toHaveCount(100);
    
    // Check format: TXN + YMD + 7 chars
    foreach ($refs as $ref) {
        expect($ref)->toMatch('/^TXN\d{8}[A-Z0-9]{7}$/');
    }
});