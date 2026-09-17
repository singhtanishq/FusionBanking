<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\BankAccount;
use App\Models\Transaction;
use App\Models\Beneficiary;
use App\Models\Loan;
use App\Models\LoanProduct;
use App\Models\FixedDeposit;
use App\Models\FDProduct;
use App\Models\Application;
use App\Models\ApplicationStep;
use App\Models\PersonalInformation;
use App\Models\ContactInformation;
use App\Models\AddressInformation;
use App\Models\KycInformation;
use App\Models\KycDocument;
use App\Enums\ApplicationStatus;
use App\Enums\ApplicationStepStatus;
use App\Enums\AccountStatus;
use App\Enums\LoanStatus;
use App\Enums\FDStatus;
use App\Enums\TransactionType;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->createDemoCustomers();
    }

    private function createDemoCustomers(): void
    {
        $customers = [
            [
                'customer_id' => 'CUS1000001',
                'email' => 'rahul.sharma@email.com',
                'mobile' => '9876543210',
                'full_name' => 'Rahul Sharma',
                'father_name' => 'Suresh Sharma',
                'mother_name' => 'Sunita Sharma',
                'date_of_birth' => '1990-05-15',
                'gender' => 'male',
                'marital_status' => 'married',
                'nationality' => 'Indian',
                'occupation' => 'Software Engineer',
                'annual_income' => 1200000,
                'pan_number' => 'ABCDE1234F',
                'aadhaar_number' => '123456789012',
                'kyc_type' => 'full',
                'kyc_verified_at' => Carbon::now()->subMonths(2),
                'netbanking_activated_at' => Carbon::now()->subMonths(2),
                'password' => Hash::make('customer123'),
                'is_active' => true,
            ],
            [
                'customer_id' => 'CUS1000002',
                'email' => 'priya.patel@email.com',
                'mobile' => '9876543211',
                'full_name' => 'Priya Patel',
                'father_name' => 'Ramesh Patel',
                'mother_name' => 'Meera Patel',
                'date_of_birth' => '1992-08-22',
                'gender' => 'female',
                'marital_status' => 'single',
                'nationality' => 'Indian',
                'occupation' => 'Marketing Manager',
                'annual_income' => 900000,
                'pan_number' => 'FGHIJ5678K',
                'aadhaar_number' => '234567890123',
                'kyc_type' => 'full',
                'kyc_verified_at' => Carbon::now()->subMonth(),
                'netbanking_activated_at' => Carbon::now()->subMonth(),
                'password' => Hash::make('customer123'),
                'is_active' => true,
            ],
            [
                'customer_id' => 'CUS1000003',
                'email' => 'amit.kumar@email.com',
                'mobile' => '9876543212',
                'full_name' => 'Amit Kumar',
                'father_name' => 'Rajesh Kumar',
                'mother_name' => 'Pooja Kumar',
                'date_of_birth' => '1988-11-30',
                'gender' => 'male',
                'marital_status' => 'married',
                'nationality' => 'Indian',
                'occupation' => 'Business Owner',
                'annual_income' => 2500000,
                'pan_number' => 'KLMNO9012P',
                'aadhaar_number' => '345678901234',
                'kyc_type' => 'full',
                'kyc_verified_at' => Carbon::now()->subDays(15),
                'netbanking_activated_at' => Carbon::now()->subDays(15),
                'password' => Hash::make('customer123'),
                'is_active' => true,
            ],
        ];

        foreach ($customers as $customerData) {
            $customer = Customer::firstOrCreate(
                ['customer_id' => $customerData['customer_id']],
                $customerData
            );

            // Create addresses
            $this->createAddresses($customer);

            // Create bank account
            $account = $this->createBankAccount($customer);

            // Create initial deposit transaction
            $this->createInitialDeposit($account);

            // Create sample transactions
            $this->createSampleTransactions($account, $customer);

            // Create beneficiaries
            $this->createBeneficiaries($customer);

            // Create loans
            $this->createLoans($customer, $account);

            // Create fixed deposits
            $this->createFixedDeposits($customer, $account);
        }

        // Create demo applications in various states
        $this->createDemoApplications();
    }

    private function createAddresses(Customer $customer): void
    {
        \App\Models\CustomerAddress::firstOrCreate(
            ['customer_id' => $customer->id, 'type' => 'residential'],
            [
                'address_line_1' => '123 MG Road',
                'address_line_2' => 'Near Metro Station',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'postal_code' => '400001',
                'country' => 'India',
                'is_primary' => true,
                'is_verified' => true,
                'verified_at' => now(),
            ]
        );

        \App\Models\CustomerAddress::firstOrCreate(
            ['customer_id' => $customer->id, 'type' => 'permanent'],
            [
                'address_line_1' => '456 Park Street',
                'city' => 'Delhi',
                'state' => 'Delhi',
                'postal_code' => '110001',
                'country' => 'India',
                'is_primary' => false,
                'is_verified' => true,
                'verified_at' => now(),
            ]
        );
    }

    private function createBankAccount(Customer $customer): BankAccount
    {
        return BankAccount::firstOrCreate(
            ['customer_id' => $customer->id, 'is_primary' => true],
            [
                'account_number' => '50' . Str::padLeft((string) $customer->id, 10, '0'),
                'ifsc_code' => 'FUSB0001001',
                'account_type' => 'savings',
                'status' => AccountStatus::ACTIVE,
                'balance' => 100000,
                'available_balance' => 100000,
                'opening_date' => Carbon::now()->subMonths(2),
                'is_primary' => true,
            ]
        );
    }

    private function createInitialDeposit(BankAccount $account): void
    {
        Transaction::firstOrCreate(
            ['account_id' => $account->id, 'type' => TransactionType::CASH_DEPOSIT, 'reference_number' => 'TXN' . $account->id . 'INIT'],
            [
                'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'account_id' => $account->id,
                'type' => TransactionType::CASH_DEPOSIT,
                'direction' => 'credit',
                'amount' => 100000,
                'opening_balance' => 0,
                'closing_balance' => 100000,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => 'Initial cash deposit on account opening',
                'completed_at' => $account->opening_date,
            ]
        );
    }

    private function createSampleTransactions(BankAccount $account, Customer $customer): void
    {
        $transactions = [
            ['type' => TransactionType::MONEY_RECEIVED, 'amount' => 25000, 'description' => 'Salary credit', 'days_ago' => 5],
            ['type' => TransactionType::MONEY_SENT, 'amount' => 5000, 'description' => 'Transfer to Priya Patel', 'days_ago' => 3],
            ['type' => TransactionType::MONEY_RECEIVED, 'amount' => 10000, 'description' => 'Freelance payment', 'days_ago' => 1],
            ['type' => TransactionType::INTEREST_CREDIT, 'amount' => 450, 'description' => 'Savings interest', 'days_ago' => 0],
        ];

        $balance = 100000;
        
        foreach ($transactions as $txn) {
            $direction = in_array($txn['type'], [TransactionType::MONEY_SENT]) ? 'debit' : 'credit';
            $balance = $direction === 'credit' ? $balance + $txn['amount'] : $balance - $txn['amount'];

            Transaction::firstOrCreate(
                [
                    'account_id' => $account->id,
                    'type' => $txn['type'],
                    'amount' => $txn['amount'],
                    'reference_number' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(6)),
                ],
                [
                    'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                    'reference_number' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                    'account_id' => $account->id,
                    'type' => $txn['type'],
                    'direction' => $direction,
                    'amount' => $txn['amount'],
                    'opening_balance' => $balance - ($direction === 'credit' ? $txn['amount'] : -$txn['amount']),
                    'closing_balance' => $balance,
                    'currency' => 'INR',
                    'status' => 'completed',
                    'description' => $txn['description'],
                    'completed_at' => Carbon::now()->subDays($txn['days_ago']),
                ]
            );
        }

        // Update account balance
        $account->update(['balance' => $balance, 'available_balance' => $balance]);
    }

    private function createBeneficiaries(Customer $customer): void
    {
        $otherCustomers = Customer::where('id', '!=', $customer->id)->get();

        foreach ($otherCustomers as $other) {
            $otherAccount = $other->primaryAccount;
            if ($otherAccount) {
                Beneficiary::firstOrCreate(
                    ['customer_id' => $customer->id, 'account_number' => $otherAccount->account_number],
                    [
                        'name' => $other->full_name,
                        'account_number' => $otherAccount->account_number,
                        'ifsc_code' => $otherAccount->ifsc_code,
                        'nickname' => $other->full_name,
                        'is_verified' => true,
                        'verified_at' => now(),
                        'cooling_period_ends_at' => Carbon::now()->subHours(24),
                    ]
                );
            }
        }
    }

    private function createLoans(Customer $customer, BankAccount $account): void
    {
        $personalLoan = LoanProduct::where('code', 'PL')->first();
        $educationLoan = LoanProduct::where('code', 'EL')->first();

        if ($personalLoan) {
            Loan::firstOrCreate(
                ['customer_id' => $customer->id, 'loan_product_id' => $personalLoan->id],
                [
                    'loan_number' => 'LN' . now()->format('Ymd') . Str::upper(Str::random(6)),
                    'account_id' => $account->id,
                    'status' => $customer->customer_id === 'CUS1000001' ? LoanStatus::ACTIVE : LoanStatus::APPROVED,
                    'principal_amount' => 300000,
                    'approved_amount' => 300000,
                    'interest_rate' => 10.50,
                    'tenure_months' => 36,
                    'emi' => 9750,
                    'total_interest' => 51000,
                    'total_repayment' => 351000,
                    'purpose' => 'Home renovation',
                    'employment_type' => 'salaried',
                    'employer_name' => 'TechCorp Solutions',
                    'employment_duration_months' => 48,
                    'monthly_salary' => 100000,
                    'existing_obligations' => 5000,
                    'approved_at' => Carbon::now()->subMonth(),
                    'disbursed_at' => Carbon::now()->subMonth(),
                    'first_emi_date' => Carbon::now()->addMonth()->startOfMonth(),
                    'maturity_date' => Carbon::now()->addMonths(36)->endOfMonth(),
                ]
            );
        }

        if ($educationLoan && $customer->customer_id === 'CUS1000002') {
            Loan::firstOrCreate(
                ['customer_id' => $customer->id, 'loan_product_id' => $educationLoan->id],
                [
                    'loan_number' => 'LN' . now()->format('Ymd') . Str::upper(Str::random(6)),
                    'account_id' => $account->id,
                    'status' => LoanStatus::UNDER_REVIEW,
                    'principal_amount' => 800000,
                    'interest_rate' => 8.75,
                    'tenure_months' => 84,
                    'purpose' => 'MBA at IIM',
                    'employment_type' => 'salaried',
                    'employer_name' => 'Marketing Inc',
                    'employment_duration_months' => 36,
                    'monthly_salary' => 75000,
                    'existing_obligations' => 0,
                ]
            );
        }
    }

    private function createFixedDeposits(Customer $customer, BankAccount $account): void
    {
        $fdProducts = FDProduct::where('is_active', true)->get();

        foreach ($fdProducts->take(2) as $index => $product) {
            $principal = 100000 + ($index * 50000);
            $maturity = $principal * (1 + ($product->interest_rate / 100) * ($product->min_tenure_months / 12));

            FixedDeposit::firstOrCreate(
                ['customer_id' => $customer->id, 'fd_product_id' => $product->id],
                [
                    'fd_number' => 'FD' . now()->format('Ymd') . Str::upper(Str::random(6)),
                    'account_id' => $account->id,
                    'status' => FDStatus::ACTIVE,
                    'principal_amount' => $principal,
                    'interest_rate' => $product->interest_rate,
                    'tenure_months' => $product->min_tenure_months,
                    'maturity_amount' => round($maturity, 2),
                    'maturity_date' => Carbon::now()->addMonths($product->min_tenure_months)->endOfMonth(),
                    'opened_at' => Carbon::now()->subMonths($index + 1),
                    'auto_renew' => false,
                ]
            );
        }
    }

    private function createDemoApplications(): void
    {
        $statuses = [
            ApplicationStatus::SUBMITTED,
            ApplicationStatus::UNDER_REVIEW,
            ApplicationStatus::PARTIALLY_APPROVED,
            ApplicationStatus::CORRECTION_REQUIRED,
            ApplicationStatus::FINAL_REVIEW,
            ApplicationStatus::APPROVED,
            ApplicationStatus::REJECTED,
        ];

        foreach ($statuses as $index => $status) {
            $app = Application::firstOrCreate(
                ['acknowledgement_number' => 'FBK-2026-' . Str::upper(Str::random(8))],
                [
                    'status' => $status,
                    'preferred_account_type' => 'savings',
                    'submitted_at' => Carbon::now()->subDays(rand(1, 30)),
                    'metadata' => ['demo' => true],
                ]
            );

            // Create steps
            $stepKeys = ['personal_info', 'contact_info', 'kyc_info', 'address_info', 'documents', 'review'];
            foreach ($stepKeys as $order => $key) {
                $stepStatus = match (true) {
                    $status === ApplicationStatus::APPROVED => ApplicationStepStatus::VERIFIED,
                    $status === ApplicationStatus::REJECTED => ApplicationStepStatus::REJECTED,
                    $status === ApplicationStatus::CORRECTION_REQUIRED => $order === 2 ? ApplicationStepStatus::CORRECTION_REQUIRED : ApplicationStepStatus::VERIFIED,
                    $status === ApplicationStatus::FINAL_REVIEW => ApplicationStepStatus::VERIFIED,
                    $status === ApplicationStatus::PARTIALLY_APPROVED => $order < 3 ? ApplicationStepStatus::VERIFIED : ApplicationStepStatus::IN_REVIEW,
                    default => $order === 0 ? ApplicationStepStatus::IN_REVIEW : ApplicationStepStatus::PENDING,
                };

                ApplicationStep::firstOrCreate(
                    ['application_id' => $app->id, 'step_key' => $key],
                    [
                        'step_name' => ucwords(str_replace('_', ' ', $key)),
                        'step_order' => $order + 1,
                        'status' => $stepStatus,
                        'reviewed_at' => $stepStatus === ApplicationStepStatus::VERIFIED ? Carbon::now()->subDays(rand(1, 5)) : null,
                    ]
                );
            }

            // Create personal info
            PersonalInformation::firstOrCreate(
                ['application_id' => $app->id],
                [
                    'full_name' => 'Demo Applicant ' . ($index + 1),
                    'father_name' => 'Father Name',
                    'mother_name' => 'Mother Name',
                    'date_of_birth' => '1990-01-01',
                    'gender' => 'male',
                    'marital_status' => 'single',
                    'nationality' => 'Indian',
                    'occupation' => 'Engineer',
                    'annual_income' => 1000000,
                    'preferred_account_type' => 'savings',
                ]
            );

            ContactInformation::firstOrCreate(
                ['application_id' => $app->id],
                [
                    'mobile_number' => '987654321' . $index,
                    'email' => "demo{$index}@fusionbanking.local",
                    'address_line_1' => '123 Demo Street',
                    'city' => 'Mumbai',
                    'state' => 'Maharashtra',
                    'postal_code' => '400001',
                    'country' => 'India',
                ]
            );

            AddressInformation::firstOrCreate(
                ['application_id' => $app->id],
                [
                    'residential_address_line_1' => '123 Demo Street',
                    'residential_city' => 'Mumbai',
                    'residential_state' => 'Maharashtra',
                    'residential_postal_code' => '400001',
                    'residential_country' => 'India',
                    'permanent_address_line_1' => '123 Demo Street',
                    'permanent_city' => 'Mumbai',
                    'permanent_state' => 'Maharashtra',
                    'permanent_postal_code' => '400001',
                    'permanent_country' => 'India',
                    'same_as_residential' => true,
                ]
            );

            KycInformation::firstOrCreate(
                ['application_id' => $app->id],
                [
                    'pan_number' => 'ABCDE' . rand(1000, 9999) . 'F',
                    'aadhaar_number' => '1234567890' . $index,
                    'kyc_type' => 'full',
                ]
            );
        }
    }
}