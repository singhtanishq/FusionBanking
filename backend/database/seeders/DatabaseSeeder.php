<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\SystemSetting;
use App\Models\LoanProduct;
use App\Models\FDProduct;
use App\Models\Promotion;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->createRolesAndPermissions();
        $this->createAdmins();
        $this->createSystemSettings();
        $this->createLoanProducts();
        $this->createFDProducts();
        $this->createPromotions();
        
        // Create demo data (customers, accounts, transactions, etc.)
        $this->call(DemoDataSeeder::class);
    }

    private function createRolesAndPermissions(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Applications
            'applications.view',
            'applications.review',
            'applications.approve',
            'applications.reject',
            
            // Customers
            'customers.view',
            'customers.edit',
            'customers.restrict',
            
            // Accounts
            'accounts.view',
            'accounts.freeze',
            'accounts.unfreeze',
            'accounts.close',
            
            // Transactions
            'transactions.view',
            'transactions.adjust',
            
            // Loans
            'loans.view',
            'loans.approve',
            'loans.reject',
            'loans.disbursed',
            
            // Fixed Deposits
            'fixed_deposits.view',
            'fixed_deposits.manage',
            
            // Admins
            'admins.view',
            'admins.manage',
            
            // System
            'system.settings',
            'audit.view',
            'promotions.manage',
            'support.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'admin']);
        }

        // Create roles
        $masterAdmin = Role::firstOrCreate(['name' => 'master_admin', 'guard_name' => 'admin']);
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'admin']);

        // Assign all permissions to master_admin
        $masterAdmin->givePermissionTo(Permission::all());

        // Assign limited permissions to admin
        $admin->givePermissionTo([
            'applications.view',
            'applications.review',
            'applications.approve',
            'applications.reject',
            'customers.view',
            'customers.restrict',
            'accounts.view',
            'accounts.freeze',
            'accounts.unfreeze',
            'transactions.view',
            'loans.view',
            'loans.approve',
            'loans.reject',
            'fixed_deposits.view',
            'audit.view',
            'support.manage',
        ]);
    }

    private function createAdmins(): void
    {
        // Master Admin
        $masterAdmin = Admin::firstOrCreate(
            ['username' => 'masteradmin'],
            [
                'email' => 'master@fusionbanking.local',
                'password' => Hash::make(config('app.demo_master_password', 'master123')),
                'full_name' => 'Master Administrator',
                'bank_access_token' => 'MASTER-ACCESS-TOKEN-2024',
                'is_master' => true,
                'is_active' => true,
            ]
        );
        $masterAdmin->assignRole('master_admin');

        // Regular Admin
        $admin = Admin::firstOrCreate(
            ['username' => 'admin'],
            [
                'email' => 'admin@fusionbanking.local',
                'password' => Hash::make(config('app.demo_admin_password', 'admin123')),
                'full_name' => 'Bank Administrator',
                'bank_access_token' => 'ADMIN-ACCESS-TOKEN-2024',
                'is_master' => false,
                'is_active' => true,
            ]
        );
        $admin->assignRole('admin');
    }

    private function createSystemSettings(): void
    {
        $settings = [
            ['key' => 'transfer_daily_limit', 'value' => 500000, 'type' => 'integer', 'description' => 'Daily transfer limit per customer', 'group' => 'transfers'],
            ['key' => 'transfer_single_limit', 'value' => 200000, 'type' => 'integer', 'description' => 'Single transfer limit', 'group' => 'transfers'],
            ['key' => 'otp_expiry_minutes', 'value' => 10, 'type' => 'integer', 'description' => 'OTP/Token expiry in minutes', 'group' => 'security'],
            ['key' => 'max_otp_attempts', 'value' => 3, 'type' => 'integer', 'description' => 'Maximum OTP verification attempts', 'group' => 'security'],
            ['key' => 'password_min_length', 'value' => 10, 'type' => 'integer', 'description' => 'Minimum password length', 'group' => 'security'],
            ['key' => 'loan_min_amount', 'value' => 10000, 'type' => 'integer', 'description' => 'Minimum loan amount', 'group' => 'loans'],
            ['key' => 'loan_max_amount', 'value' => 5000000, 'type' => 'integer', 'description' => 'Maximum loan amount', 'group' => 'loans'],
            ['key' => 'fd_min_amount', 'value' => 10000, 'type' => 'integer', 'description' => 'Minimum FD amount', 'group' => 'fixed_deposits'],
            ['key' => 'fd_max_amount', 'value' => 10000000, 'type' => 'integer', 'description' => 'Maximum FD amount', 'group' => 'fixed_deposits'],
            ['key' => 'beneficiary_cooling_hours', 'value' => 24, 'type' => 'integer', 'description' => 'Cooling period for new beneficiaries (hours)', 'group' => 'transfers'],
            ['key' => 'session_lifetime', 'value' => 120, 'type' => 'integer', 'description' => 'Session lifetime in minutes', 'group' => 'security'],
            ['key' => 'max_login_attempts', 'value' => 5, 'type' => 'integer', 'description' => 'Maximum failed login attempts before lockout', 'group' => 'security'],
            ['key' => 'lockout_duration', 'value' => 15, 'type' => 'integer', 'description' => 'Lockout duration in minutes', 'group' => 'security'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::firstOrCreate(
                ['key' => $setting['key']],
                array_merge($setting, ['is_public' => false])
            );
        }
    }

    private function createLoanProducts(): void
    {
        $products = [
            [
                'name' => 'Personal Loan',
                'code' => 'PL',
                'description' => 'Unsecured personal loan for any purpose',
                'min_amount' => 50000,
                'max_amount' => 1000000,
                'min_tenure_months' => 12,
                'max_tenure_months' => 60,
                'interest_rate' => 10.50,
                'processing_fee_percent' => 1.5,
                'is_active' => true,
            ],
            [
                'name' => 'Education Loan',
                'code' => 'EL',
                'description' => 'Loan for higher education expenses',
                'min_amount' => 100000,
                'max_amount' => 2000000,
                'min_tenure_months' => 24,
                'max_tenure_months' => 120,
                'interest_rate' => 8.75,
                'processing_fee_percent' => 1.0,
                'is_active' => true,
            ],
            [
                'name' => 'Business Loan',
                'code' => 'BL',
                'description' => 'Loan for business expansion and working capital',
                'min_amount' => 500000,
                'max_amount' => 5000000,
                'min_tenure_months' => 12,
                'max_tenure_months' => 84,
                'interest_rate' => 11.25,
                'processing_fee_percent' => 2.0,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            LoanProduct::firstOrCreate(['code' => $product['code']], $product);
        }
    }

    private function createFDProducts(): void
    {
        $products = [
            [
                'name' => 'Standard FD - 1 Year',
                'code' => 'FD1Y',
                'description' => 'Fixed deposit with 1 year tenure',
                'min_amount' => 10000,
                'max_amount' => 10000000,
                'min_tenure_months' => 12,
                'max_tenure_months' => 12,
                'interest_rate' => 6.50,
                'is_active' => true,
            ],
            [
                'name' => 'Standard FD - 2 Years',
                'code' => 'FD2Y',
                'description' => 'Fixed deposit with 2 year tenure',
                'min_amount' => 10000,
                'max_amount' => 10000000,
                'min_tenure_months' => 24,
                'max_tenure_months' => 24,
                'interest_rate' => 6.75,
                'is_active' => true,
            ],
            [
                'name' => 'Standard FD - 3 Years',
                'code' => 'FD3Y',
                'description' => 'Fixed deposit with 3 year tenure',
                'min_amount' => 10000,
                'max_amount' => 10000000,
                'min_tenure_months' => 36,
                'max_tenure_months' => 36,
                'interest_rate' => 7.00,
                'is_active' => true,
            ],
            [
                'name' => 'Standard FD - 5 Years',
                'code' => 'FD5Y',
                'description' => 'Fixed deposit with 5 year tenure (tax saver)',
                'min_amount' => 10000,
                'max_amount' => 150000,
                'min_tenure_months' => 60,
                'max_tenure_months' => 60,
                'interest_rate' => 7.25,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            FDProduct::firstOrCreate(['code' => $product['code']], $product);
        }
    }

    private function createPromotions(): void
    {
        $promotions = [
            [
                'title' => 'Open a Digital Savings Account',
                'subtitle' => 'Zero balance requirement, instant activation',
                'cta_text' => 'Open Now',
                'cta_url' => '/open-account',
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'title' => 'Earn More with Fixed Deposits',
                'subtitle' => 'Up to 7.25% p.a. with flexible tenures',
                'cta_text' => 'Invest Now',
                'cta_url' => '/products/fd',
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'title' => 'Flexible Personal Loans',
                'subtitle' => 'Up to ₹50 Lakhs with quick approval',
                'cta_text' => 'Apply Now',
                'cta_url' => '/products/loans',
                'is_active' => true,
                'display_order' => 3,
            ],
            [
                'title' => 'Smart Banking Tools',
                'subtitle' => 'Track spending, set budgets, achieve goals',
                'cta_text' => 'Explore',
                'cta_url' => '/features',
                'is_active' => true,
                'display_order' => 4,
            ],
        ];

        foreach ($promotions as $promotion) {
            Promotion::firstOrCreate(['title' => $promotion['title']], $promotion);
        }
    }
}