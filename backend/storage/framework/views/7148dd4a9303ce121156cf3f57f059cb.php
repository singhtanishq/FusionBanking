<?php if (isset($component)) { $__componentOriginalaa758e6a82983efcbf593f765e026bd9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalaa758e6a82983efcbf593f765e026bd9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => $__env->getContainer()->make(Illuminate\View\Factory::class)->make('mail::message'),'data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('mail::message'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
# Verify Your Transfer

Dear **<?php echo new \Illuminate\Support\EncodedHtmlString($customerName); ?>**,

You have initiated a transfer that requires verification.

## Transfer Details

| Detail | Value |
|--------|-------|
| **Transfer Reference** | `<?php echo new \Illuminate\Support\EncodedHtmlString($transfer->reference_number); ?>` |
| **Amount** | ₹<?php echo new \Illuminate\Support\EncodedHtmlString(number_format($transfer->amount, 2)); ?> |
| **Recipient** | <?php echo new \Illuminate\Support\EncodedHtmlString($transfer->receiverCustomer->full_name); ?> |
| **Recipient Account** | <?php echo new \Illuminate\Support\EncodedHtmlString($transfer->receiverAccount->getMaskedAccountNumber()); ?> |
| **Recipient IFSC** | <?php echo new \Illuminate\Support\EncodedHtmlString($transfer->receiverAccount->ifsc_code); ?> |
| **Remark** | <?php echo new \Illuminate\Support\EncodedHtmlString($transfer->remark ?? 'N/A'); ?> |
| **Total Debit** | ₹<?php echo new \Illuminate\Support\EncodedHtmlString(number_format($transfer->total_debit, 2)); ?> |

## Verification Token

Enter the following token to authorize this transfer:

**Token: `<?php echo new \Illuminate\Support\EncodedHtmlString($token); ?>`**

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
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalaa758e6a82983efcbf593f765e026bd9)): ?>
<?php $attributes = $__attributesOriginalaa758e6a82983efcbf593f765e026bd9; ?>
<?php unset($__attributesOriginalaa758e6a82983efcbf593f765e026bd9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalaa758e6a82983efcbf593f765e026bd9)): ?>
<?php $component = $__componentOriginalaa758e6a82983efcbf593f765e026bd9; ?>
<?php unset($__componentOriginalaa758e6a82983efcbf593f765e026bd9); ?>
<?php endif; ?><?php /**PATH /Users/tanishqsingh/Desktop/Personal/Projects/FusionBanking/backend/resources/views/emails/transfers/verification.blade.php ENDPATH**/ ?>