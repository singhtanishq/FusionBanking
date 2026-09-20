<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminLoginOtpNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public \App\Models\Admin $admin,
        public string $token,
        public string $ipAddress
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Your Admin Portal Login Verification Token - FusionBanking')
            ->markdown('emails.auth.admin_login_otp', [
                'admin' => $this->admin,
                'token' => $this->token,
                'ipAddress' => $this->ipAddress,
            ]);
    }
}