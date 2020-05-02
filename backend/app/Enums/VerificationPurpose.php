<?php

namespace App\Enums;

enum VerificationPurpose: string
{
    case APPLICATION_CORRECTION = 'application_correction';
    case NETBANKING_ACTIVATION = 'netbanking_activation';
    case LOGIN_OTP = 'login_otp';
    case PASSWORD_RESET = 'password_reset';
    case TRANSFER_VERIFICATION = 'transfer_verification';
    case BENEFICIARY_VERIFICATION = 'beneficiary_verification';
    case EMAIL_VERIFICATION = 'email_verification';
    case ADMIN_LOGIN = 'admin_login';

    public function label(): string
    {
        return match ($this) {
            self::APPLICATION_CORRECTION => 'Application Correction',
            self::NETBANKING_ACTIVATION => 'NetBanking Activation',
            self::LOGIN_OTP => 'Login OTP',
            self::PASSWORD_RESET => 'Password Reset',
            self::TRANSFER_VERIFICATION => 'Transfer Verification',
            self::BENEFICIARY_VERIFICATION => 'Beneficiary Verification',
            self::EMAIL_VERIFICATION => 'Email Verification',
            self::ADMIN_LOGIN => 'Admin Login',
        };
    }
}