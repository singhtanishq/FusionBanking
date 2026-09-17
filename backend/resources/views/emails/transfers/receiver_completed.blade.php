<x-mail::message>
# Money Received

Dear **{{ $customerName }}**,

You have received a transfer in your FusionBanking account.

## Transfer Details

| Detail | Value |
|--------|-------|
| **Transaction Reference** | `{{ $transfer->reference_number }}` |
| **Date & Time** | {{ $transfer->processed_at->format('d M Y, h:i A') }} |
| **Amount Received** | ₹{{ number_format($transfer->amount, 2) }} |
| **Sender** | {{ $transfer->senderCustomer->full_name }} |
| **Sender Account** | {{ $transfer->senderAccount->getMaskedAccountNumber() }} |
| **Remark** | {{ $transfer->remark ?? 'N/A' }} |
| **Available Balance** | ₹{{ number_format($transfer->receiverAccount->available_balance, 2) }} |

## Transaction Record

This transaction will appear in your transaction history with reference `{{ $transfer->reference_number }}`.

You can view the complete details in your NetBanking dashboard under Transaction History.

---

**FusionBanking**  
Secure Digital Banking Platform
</x-mail::message>