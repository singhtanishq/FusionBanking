<x-mail::message>
# Activate Your NetBanking

Dear **{{ $customer->full_name }}**,

You have requested to activate NetBanking for your FusionBanking account.

## Account Details

| Detail | Value |
|--------|-------|
| **Customer ID** | `{{ $customer->customer_id }}` |
| **Account Number** | `{{ $customer->primaryAccount->account_number ?? 'Not linked' }}` |

## Verification Token

Use the following token to complete your NetBanking activation:

**Token: `{{ $token }}`**

This token will expire in **10 minutes** and can only be used once.

## Activation Steps

1. Visit [NetBanking Activation]({{ config('app.frontend_url') }}/netbanking/activate)
2. Enter your details and this verification token
3. Set a strong password for your NetBanking account
4. Login to access your dashboard

## Security Notice

- Never share this token with anyone
- FusionBanking staff will never ask for this token via phone or email
- If you did not request NetBanking activation, please contact support immediately

---

**FusionBanking**  
Secure Digital Banking Platform
</x-mail::message>