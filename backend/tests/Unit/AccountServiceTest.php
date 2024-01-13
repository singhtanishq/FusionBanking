<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\AccountService;
use App\Models\Customer;
use App\Models\BankAccount;
use App\Models\Transaction;
use App\Enums\AccountStatus;
use App\Enums\TransactionType;

class AccountServiceTest extends TestCase
{
    public function test_account_number_generation_produces_unique_numbers()
    {
        $service = new AccountService();
        
        $numbers = [];
        for ($i = 0; $i < 100; $i++) {
            $numbers[] = $service->generateAccountNumber();
        }
        
        $this->assertCount(100, $numbers);
        $this->assertCount(100, array_unique($numbers));
        
        foreach ($numbers as $number) {
            $this->assertMatchesRegularExpression('/^50\d{10}$/', $number);
        }
    }

    public function test_customer_id_generation_produces_unique_ids()
    {
        $service = new AccountService();
        
        $ids = [];
        for ($i = 0; $i < 100; $i++) {
            $ids[] = $service->generateCustomerId();
        }
        
        $this->assertCount(100, $ids);
        $this->assertCount(100, array_unique($ids));
        
        foreach ($ids as $id) {
            $this->assertMatchesRegularExpression('/^CUS\d{7}$/', $id);
        }
    }

    public function test_acknowledgement_number_generation_produces_unique_numbers()
    {
        $service = new AccountService();
        
        $numbers = [];
        for ($i = 0; $i < 100; $i++) {
            $numbers[] = $service->generateAcknowledgementNumber();
        }
        
        $this->assertCount(100, $numbers);
        $this->assertCount(100, array_unique($numbers));
        
        foreach ($numbers as $number) {
            $this->assertMatchesRegularExpression('/^FBK-\d{4}-[A-Z0-9]{8}$/', $number);
        }
    }

    public function test_initial_deposit_creates_proper_transaction_and_updates_balance()
    {
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
        
        $this->assertNotNull($transaction);
        $this->assertEquals(TransactionType::CASH_DEPOSIT, $transaction->type);
        $this->assertEquals('credit', $transaction->direction);
        $this->assertEquals(100000, $transaction->amount);
        $this->assertEquals(0, $transaction->opening_balance);
        $this->assertEquals(100000, $transaction->closing_balance);
        $this->assertEquals('completed', $transaction->status);
        
        $account->refresh();
        $this->assertEquals(100000, $account->balance);
        $this->assertEquals(100000, $account->available_balance);
    }

    public function test_transaction_reference_generation_produces_unique_references()
    {
        $service = new AccountService();
        
        $refs = [];
        for ($i = 0; $i < 100; $i++) {
            $refs[] = $service->generateTransactionReference('TXN');
        }
        
        $this->assertCount(100, $refs);
        $this->assertCount(100, array_unique($refs));
        
        foreach ($refs as $ref) {
            $this->assertMatchesRegularExpression('/^TXN\d{8}[A-Z0-9]{7}$/', $ref);
        }
    }
}