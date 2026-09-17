<x-mail::message>
# Reset Your NetBanking Password

Dear **{{ $customer->full_name }}**,

You have requested to reset your NetBanking password.

## Account Details

| Detail | Value |
|--------|-------|
| **Customer ID** | `{{ $customer->customer_id }}` |
| **Email** | {{ $customer->email }} |

## Reset Token

Use the following token to reset your password:

**Token: `{{ $token }}`**

This token will expire in **10 minutes** and can only be used once.

## Reset Steps

1. Visit [Password Reset]({{ config('app.frontend_url') }}/netbanking/password/reset)
2. Enter your Customer ID and this verification token
3. Set a new strong password
4. Login with your new credentials

## Security Notice

- Never share this token with anyone
- FusionBanking staff will never ask for this token via phone or email
- If you did not request a password reset, please contact support immediately
- After reset, all active sessions will be invalidated for security

---

**FusionBanking**  
Secure Digital Banking Platform
</x-mail::message>