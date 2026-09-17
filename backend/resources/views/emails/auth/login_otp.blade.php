<x-mail::message>
# NetBanking Login Verification

Dear **{{ $customer->full_name }}**,

A login attempt was made to your NetBanking account. Please verify this activity.

## Login Details

| Detail | Value |
|--------|-------|
| **Customer ID** | `{{ $customer->customer_id }}` |
| **Time** | {{ now()->format('d M Y, h:i A') }} |
| **IP Address** | {{ $ipAddress }} |

## Verification Token

Enter the following token to complete your login:

**Token: `{{ $token }}`**

This token will expire in **10 minutes** and can only be used once.

## Security Notice

- **Never share this token with anyone** - FusionBanking staff will never ask for it
- If you did not attempt to login, please contact support immediately and change your password
- Always verify the website URL before entering credentials

---

**FusionBanking**  
Secure Digital Banking Platform
</x-mail::message>