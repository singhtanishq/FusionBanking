<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NetBankingActivationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public \App\Models\Customer $customer,
        public string $token
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Activate Your NetBanking - FusionBanking')
            ->markdown('emails.customers.netbanking_activation', [
                'customer' => $this->customer,
                'token' => $this->token,
            ]);
    }
}