<?php

use App\Services\FDService;

test('maturity amount calculation for 1 year FD', function () {
    $service = new FDService();
    
    // ₹1,00,000 at 6.5% for 1 year
    $maturity = $service->calculateMaturityAmount(100000, 6.5, 12);
    $interest = $service->calculateInterest(100000, 6.5, 12);
    
    // Simple interest: 100000 * 0.065 * 1 = 6500
    // Maturity: 106500
    expect($interest)->toBe(6500);
    expect($maturity)->toBe(106500);
});

test('maturity amount calculation for 5 year FD', function () {
    $service = new FDService();
    
    // ₹1,00,000 at 7.25% for 5 years
    $maturity = $service->calculateMaturityAmount(100000, 7.25, 60);
    $interest = $service->calculateInterest(100000, 7.25, 60);
    
    // Simple interest: 100000 * 0.0725 * 5 = 36250
    // Maturity: 136250
    expect($interest)->toBe(36250);
    expect($maturity)->toBe(136250);
});

test('maturity amount calculation for partial year', function () {
    $service = new FDService();
    
    // ₹50,000 at 6.75% for 18 months (1.5 years)
    $maturity = $service->calculateMaturityAmount(50000, 6.75, 18);
    $interest = $service->calculateInterest(50000, 6.75, 18);
    
    // Simple interest: 50000 * 0.0675 * 1.5 = 5062.5
    // Maturity: 55062.5
    expect($interest)->toBe(5062.5);
    expect($maturity)->toBe(55062.5);
});

test('interest calculation is consistent', function () {
    $service = new FDService();
    
    $principal = 250000;
    $rate = 7.0;
    $tenure = 36; // 3 years
    
    $maturity = $service->calculateMaturityAmount($principal, $rate, $tenure);
    $interest = $service->calculateInterest($principal, $rate, $tenure);
    
    expect($maturity - $interest)->toBe($principal);
    expect($interest)->toBe($principal * ($rate / 100) * ($tenure / 12));
});