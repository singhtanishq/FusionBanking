<?php

use App\Services\FDService;

test('maturity amount calculation for 1 year FD', function () {
    $service = new FDService();
    
    $maturity = $service->calculateMaturityAmount(100000, 6.5, 12);
    $interest = $service->calculateInterest(100000, 6.5, 12);
    
    expect($interest)->toBe(6500.0);
    expect($maturity)->toBe(106500.0);
});

test('maturity amount calculation for 5 year FD', function () {
    $service = new FDService();
    
    $maturity = $service->calculateMaturityAmount(100000, 7.25, 60);
    $interest = $service->calculateInterest(100000, 7.25, 60);
    
    expect($interest)->toBe(36250.0);
    expect($maturity)->toBe(136250.0);
});

test('maturity amount calculation for partial year', function () {
    $service = new FDService();
    
    $maturity = $service->calculateMaturityAmount(50000, 6.75, 18);
    $interest = $service->calculateInterest(50000, 6.75, 18);
    
    expect($interest)->toBe(5062.5);
    expect($maturity)->toBe(55062.5);
});

test('interest calculation is consistent', function () {
    $service = new FDService();
    
    $principal = 250000;
    $rate = 7.0;
    $tenure = 36;
    
    $maturity = $service->calculateMaturityAmount($principal, $rate, $tenure);
    $interest = $service->calculateInterest($principal, $rate, $tenure);
    
    // Use closeTo for floating point comparison
    expect($maturity - $interest)->toBeCloseTo($principal, 1);
    expect($interest)->toBeCloseTo($principal * ($rate / 100) * ($tenure / 12), 1);
});