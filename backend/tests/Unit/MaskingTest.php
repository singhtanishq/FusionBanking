<?php

use App\Models\Customer;
use App\Models\KycInformation;

test('pan masking works correctly', function () {
    $customer = Customer::factory()->make(['pan_number' => 'ABCDE1234F']);
    
    expect($customer->getMaskedPan())->toBe('ABCDE****F');
});

test('aadhaar masking works correctly', function () {
    $customer = Customer::factory()->make(['aadhaar_number' => '123456789012']);
    
    expect($customer->getMaskedAadhaar())->toBe('XXXX XXXX 9012');
});

test('kyc information pan masking', function () {
    $kyc = KycInformation::factory()->make(['pan_number' => 'FGHIJ5678K']);
    
    expect($kyc->getMaskedPan())->toBe('FGHIJ****K');
});

test('kyc information aadhaar masking', function () {
    $kyc = KycInformation::factory()->make(['aadhaar_number' => '234567890123']);
    
    expect($kyc->getMaskedAadhaar())->toBe('XXXX XXXX 0123');
});

test('bank account number masking', function () {
    $account = \App\Models\BankAccount::factory()->make(['account_number' => '501234567891']);
    
    expect($account->getMaskedAccountNumber())->toBe('XXXXXX7891');
});

test('beneficiary account number masking', function () {
    $beneficiary = \App\Models\Beneficiary::factory()->make(['account_number' => '509876543210']);
    
    expect($beneficiary->getMaskedAccountNumber())->toBe('XXXXXX3210');
});