<?php

use App\Services\LoanService;

test('emi calculation is correct for standard loan', function () {
    $service = new LoanService();
    
    // ₹10,00,000 at 10% for 20 years (240 months)
    $emi = $service->calculateEMI(1000000, 10, 240);
    
    // Expected EMI: ~₹9,650
    expect($emi)->toBeGreaterThan(9600);
    expect($emi)->toBeLessThan(9700);
});

test('emi calculation for zero interest', function () {
    $service = new LoanService();
    
    // ₹100,000 at 0% for 12 months
    $emi = $service->calculateEMI(100000, 0, 12);
    
    expect($emi)->toBeCloseTo(8333.33, 2);
});

test('emi calculation for short term', function () {
    $service = new LoanService();
    
    // ₹50,000 at 12% for 12 months
    $emi = $service->calculateEMI(50000, 12, 12);
    
    // Should be around ₹4,442
    expect($emi)->toBeGreaterThan(4400);
    expect($emi)->toBeLessThan(4500);
});

test('total interest calculation', function () {
    $service = new LoanService();
    
    $principal = 1000000;
    $rate = 10;
    $tenure = 240;
    
    $emi = $service->calculateEMI($principal, $rate, $tenure);
    $totalInterest = $service->calculateTotalInterest($principal, $rate, $tenure);
    $totalRepayment = $service->calculateTotalRepayment($principal, $rate, $tenure);
    
    expect($totalInterest)->toBeCloseTo($emi * $tenure - $principal, 2);
    expect($totalRepayment)->toBeCloseTo($emi * $tenure, 2);
    expect($totalRepayment)->toBeCloseTo($principal + $totalInterest, 2);
});

test('amortization schedule sums to principal', function () {
    $service = new LoanService();
    
    $principal = 500000;
    $rate = 10.5;
    $tenure = 60;
    
    $schedule = $service->generateAmortizationSchedule($principal, $rate, $tenure);
    
    expect($schedule)->toHaveCount($tenure);
    
    $totalPrincipal = array_sum(array_column($schedule, 'principal_component'));
    $totalInterest = array_sum(array_column($schedule, 'interest_component'));
    
    // Total principal should equal original principal (within rounding)
    expect(abs($totalPrincipal - $principal))->toBeLessThan(1);
    
    // Last payment should have zero balance
    expect($schedule[$tenure - 1]['outstanding_balance'])->toBeLessThan(1);
    
    // Each payment should have positive components
    foreach ($schedule as $payment) {
        expect($payment['principal_component'])->toBeGreaterThan(0);
        expect($payment['interest_component'])->toBeGreaterThanOrEqual(0);
        expect($payment['total_amount'])->toBeCloseTo($payment['principal_component'] + $payment['interest_component'], 2);
    }
});

test('repayment ratio calculation', function () {
    $service = new LoanService();
    
    $principal = 500000;
    $rate = 10;
    $tenure = 60;
    $monthlySalary = 50000;
    $existingObligations = 5000;
    
    $emi = $service->calculateEMI($principal, $rate, $tenure);
    $ratio = (($emi + $existingObligations) / $monthlySalary) * 100;
    
    // EMI ~₹10,624, ratio = (10624 + 5000) / 50000 * 100 = 31.25%
    expect($ratio)->toBeGreaterThan(30);
    expect($ratio)->toBeLessThan(35);
});