<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\SecurityEvent;
use App\Models\CustomerSession;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SecurityController extends Controller
{
    public function events(Request $request): \Illuminate\Http\JsonResponse
    {
        $customer = $request->user();
        $events = SecurityEvent::where('customer_id', $customer->id)
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $events->map(function ($event) {
                return [
                    'id' => $event->id,
                    'event_type' => $event->event_type,
                    'description' => $event->description,
                    'ip_address' => $event->ip_address,
                    'user_agent' => $event->user_agent,
                    'severity' => $event->severity,
                    'created_at' => $event->created_at?->toISOString(),
                ];
            }),
            'pagination' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'total' => $events->total(),
            ],
        ]);
    }

    public function sessions(Request $request): \Illuminate\Http\JsonResponse
    {
        $customer = $request->user();
        $sessions = CustomerSession::where('customer_id', $customer->id)
            ->where('is_revoked', false)
            ->latest('last_activity_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sessions->map(function ($session) {
                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'device_info' => $session->device_info,
                    'last_activity_at' => $session->last_activity_at?->toISOString(),
                    'expires_at' => $session->expires_at?->toISOString(),
                    'is_current' => $session->session_token === $request->user()->currentAccessToken()?->token,
                ];
            }),
        ]);
    }

    public function revokeSession(Request $request, CustomerSession $session): JsonResponse
    {
        if ($session->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found',
            ], 404);
        }

        $session->revoke();

        return response()->json([
            'success' => true,
            'message' => 'Session revoked successfully',
        ]);
    }

    public function revokeAllSessions(Request $request): JsonResponse
    {
        $customer = $request->user();
        $currentToken = $customer->currentAccessToken();

        $customer->sessions()
            ->where('is_revoked', false)
            ->where('session_token', '!=', $currentToken?->token)
            ->update(['is_revoked' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All other sessions revoked successfully',
        ]);
    }
}