<?php $__env->startComponent('mail::message'); ?>
# Admin Portal Login Verification

Hello **<?php echo new \Illuminate\Support\EncodedHtmlString($admin->full_name); ?>**,

A login attempt was made to your FusionBanking Admin Portal account from **<?php echo new \Illuminate\Support\EncodedHtmlString($ipAddress); ?>**.

## Verification Token

Enter the following token to complete your login:

**Token: `<?php echo new \Illuminate\Support\EncodedHtmlString($token); ?>`**

This token will expire in **10 minutes** and can only be used once.

## Security Notice

- **Never share this token with anyone** - FusionBanking staff will never ask for it
- If you did not attempt to login, please contact support immediately and change your password
- The FusionBanking Admin Portal is a restricted area - unauthorized access is prohibited

---

If you did not request this login, please ignore this email and consider changing your password for security.

<?php $__env->startComponent('mail::button', ['url' => config('app.frontend_url') . '/admin/login']); ?>
Admin Portal Login
<?php echo $__env->renderComponent(); ?>

Thanks,<br>
<?php echo new \Illuminate\Support\EncodedHtmlString(config('app.name')); ?> Security Team
<?php echo $__env->renderComponent(); ?><?php /**PATH /Users/tanishqsingh/Desktop/Personal/Projects/FusionBanking/backend/resources/views/emails/auth/admin_login_otp.blade.php ENDPATH**/ ?>