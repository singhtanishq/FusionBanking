<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public \App\Models\Customer $customer,
        public \App\Models\BankAccount $account
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to FusionBanking - Your Account Details')
            ->markdown('emails.customers.welcome', [
                'customer' => $this->customer,
                'account' => $this->account,
            ]);
    }
}