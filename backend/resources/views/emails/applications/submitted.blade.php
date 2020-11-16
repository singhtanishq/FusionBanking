<x-mail::message>
# Application Submitted Successfully

Dear **{{ $customerName }}**,

Thank you for choosing FusionBanking. Your account opening application has been successfully submitted.

## Application Details

| Detail | Value |
|--------|-------|
| **Acknowledgement Number** | `{{ $application->acknowledgement_number }}` |
| **Submission Date** | {{ $application->submitted_at->format('d M Y, h:i A') }} |
| **Account Type** | {{ ucfirst($application->preferred_account_type) }} |
| **Email** | {{ $application->contactInfo->email ?? 'Not provided' }} |

## What Happens Next?

Your application will go through the following verification stages:

1. **Personal Information Verification**
2. **Contact Details Verification**
3. **KYC Verification**
4. **Identity Document Verification**
5. **Address Document Verification**
6. **Risk & Compliance Review**
7. **Final Approval**
8. **Account Creation & Activation**

## Track Your Application

You can track your application status anytime using your acknowledgement number at:
[Track Application]({{ config('app.frontend_url') }}/track-application)

## Important Notes

- Keep your acknowledgement number safe for future reference
- You will receive email updates at each stage of the review process
- If any correction is needed, you will receive a separate email with a verification token
- Estimated processing time: 3-5 business days

If you have any questions, please contact our support team.

Thank you for choosing FusionBanking.

---

**FusionBanking**  
Secure Digital Banking Platform  
[Website]({{ config('app.frontend_url') }}) | [Support]({{ config('app.frontend_url') }}/support)
</x-mail::message>