<?php

namespace App\Services;

use App\Models\VerificationToken;
use App\Models\Customer;
use App\Models\Admin;
use App\Enums\VerificationPurpose;
use Illuminate\Support\Facades\DB;
use Exception;

class VerificationTokenService
{
    private const TOKEN_LENGTH = 16;
    private const DEFAULT_EXPIRY_MINUTES = 10;
    private const DEFAULT_MAX_ATTEMPTS = 3;

    public function generateToken(
        $user,
        VerificationPurpose $purpose,
        string $resourceType = null,
        int $resourceId = null,
        int $expiryMinutes = null,
        int $maxAttempts = null
    ): array {
        $token = VerificationToken::generateToken(self::TOKEN_LENGTH);
        $tokenHash = VerificationToken::hashToken($token);

        $expiryMinutes = $expiryMinutes ?? \App\Models\SystemSetting::get('otp_expiry_minutes', self::DEFAULT_EXPIRY_MINUTES);
        $maxAttempts = $maxAttempts ?? \App\Models\SystemSetting::get('max_otp_attempts', self::DEFAULT_MAX_ATTEMPTS);

        // Invalidate any existing unused tokens for same purpose and resource
        if ($resourceType && $resourceId) {
            VerificationToken::where('resource_type', $resourceType)
                ->where('resource_id', $resourceId)
                ->where('purpose', $purpose)
                ->where('is_used', false)
                ->where('is_revoked', false)
                ->update(['is_revoked' => true]);
        }

        $verificationToken = VerificationToken::create([
            'token_hash' => $tokenHash,
            'customer_id' => $user instanceof Customer ? $user->id : null,
            'admin_id' => $user instanceof Admin ? $user->id : null,
            'purpose' => $purpose,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'expires_at' => now()->addMinutes($expiryMinutes),
            'max_attempts' => $maxAttempts,
        ]);

        return [
            'token' => $token,
            'token_id' => $verificationToken->id,
            'expires_at' => $verificationToken->expires_at,
        ];
    }

    public function verifyToken(
        string $token,
        VerificationPurpose $purpose,
        string $resourceType = null,
        int $resourceId = null,
        $user = null
    ): VerificationToken {
        $tokenHash = VerificationToken::hashToken($token);

        $query = VerificationToken::where('token_hash', $tokenHash)
            ->where('purpose', $purpose)
            ->where('is_used', false)
            ->where('is_revoked', false);

        if ($resourceType && $resourceId) {
            $query->where('resource_type', $resourceType)
                ->where('resource_id', $resourceId);
        }

        if ($user instanceof Customer) {
            $query->where('customer_id', $user->id);
        } elseif ($user instanceof Admin) {
            $query->where('admin_id', $user->id);
        }

        $verificationToken = $query->first();

        if (!$verificationToken) {
            throw new Exception('Invalid verification token');
        }

        if (!$verificationToken->isValid()) {
            $verificationToken->incrementAttempts();
            throw new Exception('Verification token has expired or exceeded maximum attempts');
        }

        $verificationToken->markAsUsed();

        return $verificationToken;
    }

    public function revokeToken(int $tokenId): void
    {
        VerificationToken::where('id', $tokenId)->update(['is_revoked' => true]);
    }

    public function revokeTokensForResource(string $resourceType, int $resourceId, VerificationPurpose $purpose): void
    {
        VerificationToken::where('resource_type', $resourceType)
            ->where('resource_id', $resourceId)
            ->where('purpose', $purpose)
            ->where('is_used', false)
            ->update(['is_revoked' => true]);
    }

    public function cleanupExpiredTokens(): int
    {
        return VerificationToken::where('expires_at', '<', now())
            ->where('is_used', false)
            ->update(['is_revoked' => true]);
    }
}