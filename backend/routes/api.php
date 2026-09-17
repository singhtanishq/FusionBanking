<?php

use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('v1')->group(function () {
    // Authentication
    Route::post('/auth/customer/login', \App\Http\Controllers\Api\AuthController::class . '@customerLogin');
    Route::post('/auth/customer/verify-otp', \App\Http\Controllers\Api\AuthController::class . '@customerVerifyOtp');
    Route::post('/auth/customer/register', \App\Http\Controllers\Api\AuthController::class . '@customerRegister');
    Route::post('/auth/customer/forgot-password', \App\Http\Controllers\Api\AuthController::class . '@customerForgotPassword');
    Route::post('/auth/customer/reset-password', \App\Http\Controllers\Api\AuthController::class . '@customerResetPassword');
    
    Route::post('/auth/admin/login', \App\Http\Controllers\Api\AuthController::class . '@adminLogin');
    Route::post('/auth/admin/verify-otp', \App\Http\Controllers\Api\AuthController::class . '@adminVerifyOtp');

    // Public application tracking
    Route::get('/track/{acknowledgementNumber}', \App\Http\Controllers\Api\TrackController::class . '@show');
    Route::post('/track/{acknowledgementNumber}/verify', \App\Http\Controllers\Api\TrackController::class . '@verify');
    Route::post('/track/{acknowledgementNumber}/correct/{stepKey}', \App\Http\Controllers\Api\TrackController::class . '@submitCorrection');

    // Application submission (public)
    Route::post('/applications', \App\Http\Controllers\Api\ApplicationController::class . '@store');
    Route::post('/applications/{application}/personal-info', \App\Http\Controllers\Api\ApplicationController::class . '@savePersonalInfo');
    Route::post('/applications/{application}/contact-info', \App\Http\Controllers\Api\ApplicationController::class . '@saveContactInfo');
    Route::post('/applications/{application}/kyc-info', \App\Http\Controllers\Api\ApplicationController::class . '@saveKycInfo');
    Route::post('/applications/{application}/address-info', \App\Http\Controllers\Api\ApplicationController::class . '@saveAddressInfo');
    Route::post('/applications/{application}/documents', \App\Http\Controllers\Api\ApplicationController::class . '@uploadDocument');
    Route::post('/applications/{application}/submit', \App\Http\Controllers\Api\ApplicationController::class . '@submit');

    // NetBanking activation (public)
    Route::post('/netbanking/activate', \App\Http\Controllers\Api\NetBankingController::class . '@activate');
    Route::post('/netbanking/verify-activation', \App\Http\Controllers\Api\NetBankingController::class . '@verifyActivation');

    // Document downloads (public but token-protected)
    Route::get('/documents/{document}/download', \App\Http\Controllers\Api\DocumentController::class . '@download');

    // Promotions
    Route::get('/promotions', \App\Http\Controllers\Api\PromotionController::class . '@index');

    // Support
    Route::post('/support/tickets', \App\Http\Controllers\Api\SupportController::class . '@store');
});

// Protected customer routes
Route::middleware(['auth:sanctum', 'customer'])->prefix('v1/customer')->group(function () {
    // Profile
    Route::get('/me', \App\Http\Controllers\Api\CustomerController::class . '@me');
    Route::put('/profile', \App\Http\Controllers\Api\CustomerController::class . '@updateProfile');
    Route::put('/password', \App\Http\Controllers\Api\CustomerController::class . '@changePassword');

    // Accounts
    Route::get('/accounts', \App\Http\Controllers\Api\AccountController::class . '@index');
    Route::get('/accounts/{account}', \App\Http\Controllers\Api\AccountController::class . '@show');

    // Transfers
    Route::post('/transfers/validate-recipient', \App\Http\Controllers\Api\TransferController::class . '@validateRecipient');
    Route::post('/transfers', \App\Http\Controllers\Api\TransferController::class . '@store');
    Route::post('/transfers/verify', \App\Http\Controllers\Api\TransferController::class . '@verify');
    Route::get('/transfers', \App\Http\Controllers\Api\TransferController::class . '@index');
    Route::get('/transfers/{transfer}', \App\Http\Controllers\Api\TransferController::class . '@show');

    // Transactions
    Route::get('/transactions', \App\Http\Controllers\Api\TransactionController::class . '@index');
    Route::get('/transactions/{transaction}', \App\Http\Controllers\Api\TransactionController::class . '@show');
    Route::get('/statements', \App\Http\Controllers\Api\TransactionController::class . '@statement');
    Route::get('/statements/download', \App\Http\Controllers\Api\TransactionController::class . '@downloadStatement');

    // Beneficiaries
    Route::get('/beneficiaries', \App\Http\Controllers\Api\BeneficiaryController::class . '@index');
    Route::post('/beneficiaries', \App\Http\Controllers\Api\BeneficiaryController::class . '@store');
    Route::get('/beneficiaries/{beneficiary}', \App\Http\Controllers\Api\BeneficiaryController::class . '@show');
    Route::put('/beneficiaries/{beneficiary}', \App\Http\Controllers\Api\BeneficiaryController::class . '@update');
    Route::delete('/beneficiaries/{beneficiary}', \App\Http\Controllers\Api\BeneficiaryController::class . '@destroy');
    Route::post('/beneficiaries/{beneficiary}/verify', \App\Http\Controllers\Api\BeneficiaryController::class . '@verify');

    // Loans
    Route::get('/loans', \App\Http\Controllers\Api\LoanController::class . '@index');
    Route::post('/loans', \App\Http\Controllers\Api\LoanController::class . '@store');
    Route::get('/loans/{loan}', \App\Http\Controllers\Api\LoanController::class . '@show');
    Route::get('/loan-products', \App\Http\Controllers\Api\LoanController::class . '@products');
    Route::post('/loans/calculate-emi', \App\Http\Controllers\Api\LoanController::class . '@calculateEmi');

    // Fixed Deposits
    Route::get('/fixed-deposits', \App\Http\Controllers\Api\FixedDepositController::class . '@index');
    Route::post('/fixed-deposits', \App\Http\Controllers\Api\FixedDepositController::class . '@store');
    Route::get('/fixed-deposits/{fd}', \App\Http\Controllers\Api\FixedDepositController::class . '@show');
    Route::get('/fd-products', \App\Http\Controllers\Api\FixedDepositController::class . '@products');
    Route::post('/fixed-deposits/{fd}/premature-close', \App\Http\Controllers\Api\FixedDepositController::class . '@prematureClose');

    // Security
    Route::get('/security/events', \App\Http\Controllers\Api\SecurityController::class . '@events');
    Route::get('/security/sessions', \App\Http\Controllers\Api\SecurityController::class . '@sessions');
    Route::delete('/security/sessions/{session}', \App\Http\Controllers\Api\SecurityController::class . '@revokeSession');
    Route::delete('/security/sessions', \App\Http\Controllers\Api\SecurityController::class . '@revokeAllSessions');

    // Notifications
    Route::get('/notifications', \App\Http\Controllers\Api\NotificationController::class . '@index');
    Route::put('/notifications/{notification}/read', \App\Http\Controllers\Api\NotificationController::class . '@markAsRead');
    Route::put('/notifications/read-all', \App\Http\Controllers\Api\NotificationController::class . '@markAllAsRead');

    // Support
    Route::get('/support/tickets', \App\Http\Controllers\Api\SupportController::class . '@index');
    Route::get('/support/tickets/{ticket}', \App\Http\Controllers\Api\SupportController::class . '@show');
    Route::post('/support/tickets/{ticket}/messages', \App\Http\Controllers\Api\SupportController::class . '@addMessage');
});

// Protected admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('v1/admin')->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', \App\Http\Controllers\Api\Admin\DashboardController::class . '@stats');
    Route::get('/dashboard/recent-activity', \App\Http\Controllers\Api\Admin\DashboardController::class . '@recentActivity');

    // Applications
    Route::get('/applications', \App\Http\Controllers\Api\Admin\ApplicationController::class . '@index');
    Route::get('/applications/{application}', \App\Http\Controllers\Api\Admin\ApplicationController::class . '@show');
    Route::post('/applications/{application}/review', \App\Http\Controllers\Api\Admin\ApplicationController::class . '@reviewStep');
    Route::post('/applications/{application}/approve', \App\Http\Controllers\Api\Admin\ApplicationController::class . '@approve');
    Route::post('/applications/{application}/reject', \App\Http\Controllers\Api\Admin\ApplicationController::class . '@reject');

    // Customers
    Route::get('/customers', \App\Http\Controllers\Api\Admin\CustomerController::class . '@index');
    Route::get('/customers/{customer}', \App\Http\Controllers\Api\Admin\CustomerController::class . '@show');
    Route::put('/customers/{customer}/restrict', \App\Http\Controllers\Api\Admin\CustomerController::class . '@restrict');
    Route::put('/customers/{customer}/unrestrict', \App\Http\Controllers\Api\Admin\CustomerController::class . '@unrestrict');

    // Accounts
    Route::get('/accounts', \App\Http\Controllers\Api\Admin\AccountController::class . '@index');
    Route::get('/accounts/{account}', \App\Http\Controllers\Api\Admin\AccountController::class . '@show');
    Route::put('/accounts/{account}/freeze', \App\Http\Controllers\Api\Admin\AccountController::class . '@freeze');
    Route::put('/accounts/{account}/unfreeze', \App\Http\Controllers\Api\Admin\AccountController::class . '@unfreeze');
    Route::put('/accounts/{account}/close', \App\Http\Controllers\Api\Admin\AccountController::class . '@close');

    // Transactions
    Route::get('/transactions', \App\Http\Controllers\Api\Admin\TransactionController::class . '@index');
    Route::get('/transactions/{transaction}', \App\Http\Controllers\Api\Admin\TransactionController::class . '@show');

    // Loans
    Route::get('/loans', \App\Http\Controllers\Api\Admin\LoanController::class . '@index');
    Route::get('/loans/{loan}', \App\Http\Controllers\Api\Admin\LoanController::class . '@show');
    Route::post('/loans/{loan}/approve', \App\Http\Controllers\Api\Admin\LoanController::class . '@approve');
    Route::post('/loans/{loan}/reject', \App\Http\Controllers\Api\Admin\LoanController::class . '@reject');
    Route::post('/loans/{loan}/disburse', \App\Http\Controllers\Api\Admin\LoanController::class . '@disburse');

    // Fixed Deposits
    Route::get('/fixed-deposits', \App\Http\Controllers\Api\Admin\FixedDepositController::class . '@index');
    Route::get('/fixed-deposits/{fd}', \App\Http\Controllers\Api\Admin\FixedDepositController::class . '@show');

    // Audit Logs
    Route::get('/audit-logs', \App\Http\Controllers\Api\Admin\AuditController::class . '@index');

    // Support
    Route::get('/support/tickets', \App\Http\Controllers\Api\Admin\SupportController::class . '@index');
    Route::get('/support/tickets/{ticket}', \App\Http\Controllers\Api\Admin\SupportController::class . '@show');
    Route::put('/support/tickets/{ticket}/assign', \App\Http\Controllers\Api\Admin\SupportController::class . '@assign');
    Route::put('/support/tickets/{ticket}/status', \App\Http\Controllers\Api\Admin\SupportController::class . '@updateStatus');
    Route::post('/support/tickets/{ticket}/messages', \App\Http\Controllers\Api\Admin\SupportController::class . '@addMessage');

    // Promotions
    Route::get('/promotions', \App\Http\Controllers\Api\Admin\PromotionController::class . '@index');
    Route::post('/promotions', \App\Http\Controllers\Api\Admin\PromotionController::class . '@store');
    Route::put('/promotions/{promotion}', \App\Http\Controllers\Api\Admin\PromotionController::class . '@update');
    Route::delete('/promotions/{promotion}', \App\Http\Controllers\Api\Admin\PromotionController::class . '@destroy');

    // System Settings
    Route::get('/settings', \App\Http\Controllers\Api\Admin\SettingsController::class . '@index');
    Route::put('/settings/{key}', \App\Http\Controllers\Api\Admin\SettingsController::class . '@update');
});

// Master admin only routes
Route::middleware(['auth:sanctum', 'master_admin'])->prefix('v1/master')->group(function () {
    // Admin management
    Route::get('/admins', \App\Http\Controllers\Api\Master\AdminController::class . '@index');
    Route::post('/admins', \App\Http\Controllers\Api\Master\AdminController::class . '@store');
    Route::get('/admins/{admin}', \App\Http\Controllers\Api\Master\AdminController::class . '@show');
    Route::put('/admins/{admin}', \App\Http\Controllers\Api\Master\AdminController::class . '@update');
    Route::delete('/admins/{admin}', \App\Http\Controllers\Api\Master\AdminController::class . '@destroy');

    // Roles & Permissions
    Route::get('/roles', \App\Http\Controllers\Api\Master\RoleController::class . '@index');
    Route::post('/roles', \App\Http\Controllers\Api\Master\RoleController::class . '@store');
    Route::put('/roles/{role}', \App\Http\Controllers\Api\Master\RoleController::class . '@update');
    Route::delete('/roles/{role}', \App\Http\Controllers\Api\Master\RoleController::class . '@destroy');

    // System Settings (full access)
    Route::get('/settings', \App\Http\Controllers\Api\Master\SettingsController::class . '@index');
    Route::put('/settings/{key}', \App\Http\Controllers\Api\Master\SettingsController::class . '@update');

    // Transaction adjustments
    Route::post('/transactions/adjust', \App\Http\Controllers\Api\Master\TransactionController::class . '@adjust');
    Route::post('/transactions/{transaction}/reverse', \App\Http\Controllers\Api\Master\TransactionController::class . '@reverse');

    // Reconciliation
    Route::get('/reconciliation', \App\Http\Controllers\Api\Master\ReconciliationController::class . '@index');
    Route::post('/reconciliation/run', \App\Http\Controllers\Api\Master\ReconciliationController::class . '@run');
});

// Logout (all authenticated)
Route::post('/logout', \App\Http\Controllers\Api\AuthController::class . '@logout')->middleware('auth:sanctum');