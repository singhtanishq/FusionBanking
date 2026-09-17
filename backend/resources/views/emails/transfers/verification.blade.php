<x-mail::message>
# Verify Your Transfer

Dear **{{ $customerName }}**,

You have initiated a transfer that requires verification.

## Transfer Details

| Detail | Value |
|--------|-------|
| **Transfer Reference** | `{{ $transfer->reference_number }}` |
| **Amount** | ₹{{ number_format($transfer->amount, 2) }} |
| **Recipient** | {{ $transfer->receiverCustomer->full_name }} |
| **Recipient Account** | {{ $transfer->receiverAccount->getMaskedAccountNumber() }} |
| **Recipient IFSC** | {{ $transfer->receiverAccount->ifsc_code }} |
| **Remark** | {{ $transfer->remark ?? 'N/A' }} |
| **Total Debit** | ₹{{ number_format($transfer->total_debit, 2) }} |

## Verification Token

Enter the following token to authorize this transfer:

**Token: `{{ $token }}`**

This token will expire in **10 minutes** and can only be used once.

## Important

- Verify all details carefully before confirming
- Once verified, the transfer cannot be cancelled
- The amount will be debited immediately upon successful verification

## Security Notice

- Never share this token with anyone
- FusionBanking staff will never ask for this token via phone or email
- If you did not initiate this transfer, contact support immediately

---

**FusionBanking**  
Secure Digital Banking Platform
</x-mail::message>