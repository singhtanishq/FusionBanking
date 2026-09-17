<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $customer = $request->user();
        $query = $customer->notifications()->latest();

        if ($request->has('unread') && $request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        $notifications = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $notifications->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at?->toISOString(),
                    'action_url' => $notification->action_url,
                    'priority' => $notification->priority,
                    'created_at' => $notification->created_at?->toISOString(),
                ];
            }),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
                'unread_count' => $customer->notifications()->whereNull('read_at')->count(),
            ],
        ]);
    }

    public function markAsRead(Request $request, \App\Models\Notification $notification): JsonResponse
    {
        if ($notification->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $customer = $request->user();
        $customer->notifications()->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }
}