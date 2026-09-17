<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CorrectionVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public \App\Models\Application $application,
        public \App\Models\ApplicationStep $step,
        public string $token
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Action Required: Application Correction - FusionBanking')
            ->markdown('emails.applications.correction_verification', [
                'application' => $this->application,
                'step' => $this->step,
                'token' => $this->token,
                'customerName' => $this->application->personalInfo->full_name ?? 'Customer',
            ]);
    }
}