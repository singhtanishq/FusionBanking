<?php

namespace App\Services;

use App\Models\Loan;
use App\Models\LoanProduct;
use App\Models\LoanPayment;
use App\Models\Transaction;
use App\Models\BankAccount;
use App\Enums\LoanStatus;
use App\Enums\TransactionType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class LoanService
{
    public function calculateEMI(float $principal, float $annualRate, int $tenureMonths): float
    {
        if ($tenureMonths <= 0) {
            throw new Exception('Tenure must be greater than 0');
        }

        $monthlyRate = $annualRate / 100 / 12;

        if ($monthlyRate == 0) {
            return $principal / $tenureMonths;
        }

        $emi = $principal * $monthlyRate * pow(1 + $monthlyRate, $tenureMonths) / (pow(1 + $monthlyRate, $tenureMonths) - 1);

        return round($emi, 2);
    }

    public function calculateTotalInterest(float $principal, float $annualRate, int $tenureMonths): float
    {
        $emi = $this->calculateEMI($principal, $annualRate, $tenureMonths);
        $totalRepayment = $emi * $tenureMonths;
        return round($totalRepayment - $principal, 2);
    }

    public function calculateTotalRepayment(float $principal, float $annualRate, int $tenureMonths): float
    {
        $emi = $this->calculateEMI($principal, $annualRate, $tenureMonths);
        return round($emi * $tenureMonths, 2);
    }

    public function generateAmortizationSchedule(float $principal, float $annualRate, int $tenureMonths): array
    {
        $emi = $this->calculateEMI($principal, $annualRate, $tenureMonths);
        $monthlyRate = $annualRate / 100 / 12;
        $balance = $principal;
        $schedule = [];

        for ($month = 1; $month <= $tenureMonths; $month++) {
            $interestComponent = round($balance * $monthlyRate, 2);
            $principalComponent = round($emi - $interestComponent, 2);

            // Adjust for last payment to handle rounding differences
            if ($month === $tenureMonths) {
                $principalComponent = $balance;
                $emi = $principalComponent + $interestComponent;
            }

            $balance = round($balance - $principalComponent, 2);

            $schedule[] = [
                'payment_number' => $month,
                'due_date' => now()->addMonths($month)->startOfMonth(),
                'principal_component' => $principalComponent,
                'interest_component' => $interestComponent,
                'total_amount' => round($emi, 2),
                'outstanding_balance' => max(0, $balance),
            ];
        }

        return $schedule;
    }

    public function applyForLoan(
        \App\Models\Customer $customer,
        BankAccount $account,
        LoanProduct $product,
        float $amount,
        int $tenureMonths,
        string $purpose,
        string $employmentType,
        ?string $employerName,
        ?int $employmentDurationMonths,
        float $monthlySalary,
        float $existingObligations
    ): Loan {
        // Validate amount
        if ($amount < $product->min_amount || $amount > $product->max_amount) {
            throw new Exception("Loan amount must be between {$product->min_amount} and {$product->max_amount}");
        }

        // Validate tenure
        if ($tenureMonths < $product->min_tenure_months || $tenureMonths > $product->max_tenure_months) {
            throw new Exception("Tenure must be between {$product->min_tenure_months} and {$product->max_tenure_months} months");
        }

        // Calculate EMI
        $emi = $this->calculateEMI($amount, $product->interest_rate, $tenureMonths);
        $totalInterest = $this->calculateTotalInterest($amount, $product->interest_rate, $tenureMonths);
        $totalRepayment = $this->calculateTotalRepayment($amount, $product->interest_rate, $tenureMonths);

        // Check repayment ratio (should not exceed 50-60% of monthly income)
        $repaymentRatio = (($emi + $existingObligations) / $monthlySalary) * 100;
        if ($repaymentRatio > 60) {
            throw new Exception("Repayment ratio ({$repaymentRatio}%) exceeds maximum allowed (60%)");
        }

        return DB::transaction(function () use (
            $customer,
            $account,
            $product,
            $amount,
            $tenureMonths,
            $purpose,
            $employmentType,
            $employerName,
            $employmentDurationMonths,
            $monthlySalary,
            $existingObligations,
            $emi,
            $totalInterest,
            $totalRepayment
        ) {
            $loan = Loan::create([
                'loan_number' => 'LN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'customer_id' => $customer->id,
                'account_id' => $account->id,
                'loan_product_id' => $product->id,
                'status' => LoanStatus::SUBMITTED,
                'principal_amount' => $amount,
                'interest_rate' => $product->interest_rate,
                'tenure_months' => $tenureMonths,
                'emi' => $emi,
                'total_interest' => $totalInterest,
                'total_repayment' => $totalRepayment,
                'purpose' => $purpose,
                'employment_type' => $employmentType,
                'employer_name' => $employerName,
                'employment_duration_months' => $employmentDurationMonths,
                'monthly_salary' => $monthlySalary,
                'existing_obligations' => $existingObligations,
            ]);

            // Create payment schedule
            $schedule = $this->generateAmortizationSchedule($amount, $product->interest_rate, $tenureMonths);
            
            foreach ($schedule as $payment) {
                LoanPayment::create([
                    'loan_id' => $loan->id,
                    'payment_number' => 'PAY' . $loan->loan_number . sprintf('%03d', $payment['payment_number']),
                    'due_date' => $payment['due_date'],
                    'principal_component' => $payment['principal_component'],
                    'interest_component' => $payment['interest_component'],
                    'total_amount' => $payment['total_amount'],
                    'status' => 'pending',
                ]);
            }

            // Log audit
            \App\Models\AuditLog::log(
                'loan_application_submitted',
                'loan',
                $loan->id,
                $customer,
                [],
                ['amount' => $amount, 'tenure' => $tenureMonths]
            );

            return $loan;
        });
    }

    public function approveLoan(Loan $loan, \App\Models\Admin $admin, float $approvedAmount, float $interestRate, int $tenureMonths): void
    {
        $emi = $this->calculateEMI($approvedAmount, $interestRate, $tenureMonths);
        $totalInterest = $this->calculateTotalInterest($approvedAmount, $interestRate, $tenureMonths);
        $totalRepayment = $this->calculateTotalRepayment($approvedAmount, $interestRate, $tenureMonths);

        DB::transaction(function () use ($loan, $admin, $approvedAmount, $interestRate, $tenureMonths, $emi, $totalInterest, $totalRepayment) {
            $oldValues = [
                'status' => $loan->status->value,
                'approved_amount' => $loan->approved_amount,
                'interest_rate' => $loan->interest_rate,
                'tenure_months' => $loan->tenure_months,
            ];

            $loan->update([
                'status' => LoanStatus::APPROVED,
                'approved_amount' => $approvedAmount,
                'interest_rate' => $interestRate,
                'tenure_months' => $tenureMonths,
                'emi' => $emi,
                'total_interest' => $totalInterest,
                'total_repayment' => $totalRepayment,
                'approved_by' => $admin->id,
                'approved_at' => now(),
                'first_emi_date' => now()->addMonth()->startOfMonth(),
                'maturity_date' => now()->addMonths($tenureMonths)->endOfMonth(),
            ]);

            // Regenerate payment schedule with approved values
            $loan->payments()->delete();
            $schedule = $this->generateAmortizationSchedule($approvedAmount, $interestRate, $tenureMonths);
            
            foreach ($schedule as $payment) {
                LoanPayment::create([
                    'loan_id' => $loan->id,
                    'payment_number' => 'PAY' . $loan->loan_number . sprintf('%03d', $payment['payment_number']),
                    'due_date' => $payment['due_date'],
                    'principal_component' => $payment['principal_component'],
                    'interest_component' => $payment['interest_component'],
                    'total_amount' => $payment['total_amount'],
                    'status' => 'pending',
                ]);
            }

            // Log audit
            \App\Models\AuditLog::log(
                'loan_approved',
                'loan',
                $loan->id,
                $admin,
                $oldValues,
                ['status' => LoanStatus::APPROVED->value, 'approved_amount' => $approvedAmount]
            );
        });
    }

    public function disburseLoan(Loan $loan): void
    {
        if ($loan->status !== LoanStatus::APPROVED) {
            throw new Exception('Loan must be approved before disbursement');
        }

        DB::transaction(function () use ($loan) {
            $account = $loan->account()->lockForUpdate()->first();
            
            if (!$account->canTransact()) {
                throw new Exception('Account is not active');
            }

            $openingBalance = $account->balance;
            $closingBalance = $openingBalance + $loan->approved_amount;

            $account->increment('balance', $loan->approved_amount);
            $account->increment('available_balance', $loan->approved_amount);

            Transaction::create([
                'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'account_id' => $account->id,
                'transfer_id' => null,
                'type' => TransactionType::LOAN_DISBURSEMENT,
                'direction' => 'credit',
                'amount' => $loan->approved_amount,
                'opening_balance' => $openingBalance,
                'closing_balance' => $closingBalance,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => "Loan disbursement for loan {$loan->loan_number}",
                'completed_at' => now(),
            ]);

            $loan->update([
                'status' => LoanStatus::DISBURSED,
                'disbursed_at' => now(),
            ]);

            // Log audit
            \App\Models\AuditLog::log(
                'loan_disbursed',
                'loan',
                $loan->id,
                $loan->customer,
                ['status' => LoanStatus::APPROVED->value],
                ['status' => LoanStatus::DISBURSED->value, 'amount' => $loan->approved_amount]
            );
        });
    }

    public function rejectLoan(Loan $loan, \App\Models\Admin $admin, string $reason): void
    {
        $loan->update([
            'status' => LoanStatus::REJECTED,
            'rejected_by' => $admin->id,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);

        \App\Models\AuditLog::log(
            'loan_rejected',
            'loan',
            $loan->id,
            $admin,
            ['status' => $loan->getOriginal('status')],
            ['status' => LoanStatus::REJECTED->value, 'reason' => $reason]
        );
    }

    public function processEmiPayment(Loan $loan, LoanPayment $payment): void
    {
        if ($payment->status !== 'pending') {
            throw new Exception('Payment is not pending');
        }

        if ($payment->loan_id !== $loan->id) {
            throw new Exception('Payment does not belong to this loan');
        }

        DB::transaction(function () use ($loan, $payment) {
            $account = $loan->account()->lockForUpdate()->first();
            
            if (!$this->canDebit($account, $payment->total_amount)) {
                throw new Exception('Insufficient balance for EMI payment');
            }

            $openingBalance = $account->balance;
            $closingBalance = $openingBalance - $payment->total_amount;

            $account->decrement('balance', $payment->total_amount);
            $account->decrement('available_balance', $payment->total_amount);

            Transaction::create([
                'transaction_id' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'reference_number' => 'TXN' . now()->format('Ymd') . Str::upper(Str::random(8)),
                'account_id' => $account->id,
                'type' => TransactionType::LOAN_REPAYMENT,
                'direction' => 'debit',
                'amount' => $payment->total_amount,
                'opening_balance' => $openingBalance,
                'closing_balance' => $closingBalance,
                'currency' => 'INR',
                'status' => 'completed',
                'description' => "EMI payment for loan {$loan->loan_number} (Installment {$payment->payment_number})",
                'completed_at' => now(),
            ]);

            $payment->update([
                'status' => 'paid',
                'paid_date' => now(),
                'transaction_id' => Transaction::latest()->first()->id,
            ]);

            // Check if loan is fully paid
            $pendingPayments = $loan->payments()->where('status', 'pending')->count();
            if ($pendingPayments === 0) {
                $loan->update([
                    'status' => LoanStatus::CLOSED,
                    'closed_at' => now(),
                ]);
            }
        });
    }

    private function canDebit(BankAccount $account, float $amount): bool
    {
        return $account->canTransact() && $account->available_balance >= $amount;
    }
}