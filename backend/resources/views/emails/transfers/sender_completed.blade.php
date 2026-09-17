<x-mail::message>
# Transfer Completed Successfully

Dear **{{ $customerName }}**,

Your transfer has been completed successfully.

## Transfer Details

| Detail | Value |
|--------|-------|
| **Transaction Reference** | `{{ $transfer->reference_number }}` |
| **Date & Time** | {{ $transfer->processed_at->format('d M Y, h:i A') }} |
| **Amount Sent** | ₹{{ number_format($transfer->amount, 2) }} |
| **Fee** | ₹{{ number_format($transfer->fee, 2) }} |
| **Total Debited** | ₹{{ number_format($transfer->total_debit, 2) }} |
| **Recipient** | {{ $transfer->receiverCustomer->full_name }} |
| **Recipient Account** | {{ $transfer->receiverAccount->getMaskedAccountNumber() }} |
| **Remark** | {{ $transfer->remark ?? 'N/A' }} |
| **Available Balance** | ₹{{ number_format($transfer->senderAccount->available_balance, 2) }} |

## Transaction Record

This transaction will appear in your transaction history with reference `{{ $transfer->reference_number }}`.

You can view the complete details in your NetBanking dashboard under Transaction History.

---

**FusionBanking**  
Secure Digital Banking Platform
</x-mail::message>