<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LoginOtpNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public \App\Models\Customer $customer,
        public string $token,
        public string $ipAddress
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your NetBanking Login Verification Code - FusionBanking')
            ->markdown('emails.auth.login_otp', [
                'customer' => $this->customer,
                'token' => $this->token,
                'ipAddress' => $this->ipAddress,
            ]);
    }
}