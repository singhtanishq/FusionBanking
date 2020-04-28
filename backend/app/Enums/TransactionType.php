<?php

namespace App\Enums;

enum TransactionType: string
{
    case CASH_DEPOSIT = 'cash_deposit';
    case MONEY_SENT = 'money_sent';
    case MONEY_RECEIVED = 'money_received';
    case LOAN_DISBURSEMENT = 'loan_disbursement';
    case LOAN_REPAYMENT = 'loan_repayment';
    case FD_CREATION = 'fd_creation';
    case FD_MATURITY = 'fd_maturity';
    case INTEREST_CREDIT = 'interest_credit';
    case REFUND = 'refund';
    case ADJUSTMENT = 'adjustment';
    case REVERSAL = 'reversal';

    public function label(): string
    {
        return match ($this) {
            self::CASH_DEPOSIT => 'Cash Deposit',
            self::MONEY_SENT => 'Money Sent',
            self::MONEY_RECEIVED => 'Money Received',
            self::LOAN_DISBURSEMENT => 'Loan Disbursement',
            self::LOAN_REPAYMENT => 'Loan Repayment',
            self::FD_CREATION => 'Fixed Deposit Creation',
            self::FD_MATURITY => 'FD Maturity',
            self::INTEREST_CREDIT => 'Interest Credit',
            self::REFUND => 'Refund',
            self::ADJUSTMENT => 'Adjustment',
            self::REVERSAL => 'Reversal',
        };
    }

    public function direction(): string
    {
        return match ($this) {
            self::CASH_DEPOSIT, self::MONEY_RECEIVED, self::LOAN_DISBURSEMENT,
            self::FD_MATURITY, self::INTEREST_CREDIT, self::REFUND => 'credit',
            self::MONEY_SENT, self::LOAN_REPAYMENT, self::FD_CREATION, self::REVERSAL => 'debit',
            self::ADJUSTMENT => 'adjustment',
        };
    }
}