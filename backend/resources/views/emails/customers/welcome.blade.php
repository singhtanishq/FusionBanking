<x-mail::message>
# Welcome to FusionBanking!

Dear **{{ $customer->full_name }}**,

Congratulations! Your account has been successfully opened and activated. Welcome to FusionBanking - your trusted digital banking partner.

## Your Account Details

| Detail | Value |
|--------|-------|
| **Customer ID** | `{{ $customer->customer_id }}` |
| **Account Number** | `{{ $account->account_number }}` |
| **Account Type** | {{ ucfirst($account->account_type) }} |
| **IFSC Code** | `{{ $account->ifsc_code }}` |
| **Opening Date** | {{ $account->opening_date->format('d M Y') }} |
| **Current Balance** | ₹{{ number_format($account->balance, 2) }} |

## Initial Deposit

Your account has been credited with an initial cash deposit of **₹1,00,000.00** as per our welcome offer. This amount is available for immediate use.

## NetBanking Activation

To access your account online, you need to activate NetBanking:

1. Visit [NetBanking Activation]({{ config('app.frontend_url') }}/netbanking/activate)
2. Enter your Customer ID, Account Number, Mobile Number, and Date of Birth
3. You will receive a verification token via email
4. Set your NetBanking password

## Security Guidelines

- **Never share** your Customer ID, password, or OTP with anyone
- **Always verify** you're on the official FusionBanking website (check for HTTPS and padlock icon)
- **Enable** transaction alerts for all activities
- **Regularly update** your password
- **Log out** after each session, especially on shared devices

## Get Started

- [Activate NetBanking]({{ config('app.frontend_url') }}/netbanking/activate)
- [Login to NetBanking]({{ config('app.frontend_url') }}/netbanking/login)
- [Explore Banking Products]({{ config('app.frontend_url') }}/products)

## Need Help?

Our support team is available to assist you:
- [Help Center]({{ config('app.frontend_url') }}/help)
- [Contact Support]({{ config('app.frontend_url') }}/support)

Thank you for choosing FusionBanking. We look forward to serving your banking needs.

---

**FusionBanking**  
Secure Digital Banking Platform  
[Website]({{ config('app.frontend_url') }}) | [Security]({{ config('app.frontend_url') }}/security)
</x-mail::message>