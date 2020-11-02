<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TransferCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public \App\Models\Transfer $transfer,
        public bool $isSender = true
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $template = $this->isSender 
            ? 'emails.transfers.sender_completed' 
            : 'emails.transfers.receiver_completed';

        return (new MailMessage)
            ->subject($this->isSender 
                ? 'Transfer Completed Successfully - FusionBanking'
                : 'Money Received - FusionBanking')
            ->markdown($template, [
                'transfer' => $this->transfer,
                'customerName' => $this->isSender 
                    ? $this->transfer->senderCustomer->full_name
                    : $this->transfer->receiverCustomer->full_name,
            ]);
    }
}