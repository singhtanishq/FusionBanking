<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TransferVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public \App\Models\Transfer $transfer,
        public string $token
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify Your Transfer - FusionBanking')
            ->markdown('emails.transfers.verification', [
                'transfer' => $this->transfer,
                'token' => $this->token,
                'customerName' => $this->transfer->senderCustomer->full_name,
            ]);
    }
}