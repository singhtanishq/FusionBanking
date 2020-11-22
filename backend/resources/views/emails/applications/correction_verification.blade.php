<x-mail::message>
# Action Required: Application Correction

Dear **{{ $customerName }}**,

Your account opening application requires a correction in one of the verification stages.

## Application Details

| Detail | Value |
|--------|-------|
| **Acknowledgement Number** | `{{ $application->acknowledgement_number }}` |
| **Stage Requiring Correction** | {{ $step->step_name }} |
| **Submission Date** | {{ $application->submitted_at->format('d M Y, h:i A') }} |

## Reason for Correction

{{ $step->rejection_reason }}

## Verification Required

To proceed with the correction, please use the following verification token:

**Token: `{{ $token }}`**

This token will expire in **10 minutes** and can only be used once.

## Next Steps

1. Visit the [Correction Page]({{ config('app.frontend_url') }}/track-application/{{ $application->acknowledgement_number }}/correct/{{ $step->step_key }})
2. Enter the verification token above
3. Update the required information
4. Submit the correction for review

## Security Notice

- Never share this token with anyone
- FusionBanking staff will never ask for this token via phone or email
- This token is valid only for the specific correction mentioned above

If you did not request this correction, please contact our support team immediately.

---

**FusionBanking**  
Secure Digital Banking Platform  
[Website]({{ config('app.frontend_url') }}) | [Support]({{ config('app.frontend_url') }}/support)
</x-mail::message>