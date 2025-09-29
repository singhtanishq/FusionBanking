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
# NetBanking Login Verification

Dear **<?php echo new \Illuminate\Support\EncodedHtmlString($customer->full_name); ?>**,

A login attempt was made to your NetBanking account. Please verify this activity.

## Login Details

| Detail | Value |
|--------|-------|
| **Customer ID** | `<?php echo new \Illuminate\Support\EncodedHtmlString($customer->customer_id); ?>` |
| **Time** | <?php echo new \Illuminate\Support\EncodedHtmlString(now()->format('d M Y, h:i A')); ?> |
| **IP Address** | <?php echo new \Illuminate\Support\EncodedHtmlString($ipAddress); ?> |

## Verification Token

Enter the following token to complete your login:

**Token: `<?php echo new \Illuminate\Support\EncodedHtmlString($token); ?>`**

This token will expire in **10 minutes** and can only be used once.

## Security Notice

- **Never share this token with anyone** - FusionBanking staff will never ask for it
- If you did not attempt to login, please contact support immediately and change your password
- Always verify the website URL before entering credentials

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
<?php endif; ?><?php /**PATH /Users/tanishqsingh/Desktop/Personal/Projects/FusionBanking/backend/resources/views/emails/auth/login_otp.blade.php ENDPATH**/ ?>