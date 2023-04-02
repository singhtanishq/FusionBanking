<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SupportController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = SupportTicket::with(['customer', 'assignedAdmin'])
            ->latest();

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        if ($request->has('assigned_admin_id') && $request->assigned_admin_id) {
            $query->where('assigned_admin_id', $request->assigned_admin_id);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('ticket_number', 'like', "%{$request->search}%")
                  ->orWhere('subject', 'like', "%{$request->search}%")
                  ->orWhereHas('customer', function ($q) use ($request) {
                      $q->where('full_name', 'like', "%{$request->search}%")
                        ->orWhere('customer_id', 'like', "%{$request->search}%");
                  });
            });
        }

        $tickets = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $tickets->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'subject' => $ticket->subject,
                    'category' => $ticket->category,
                    'priority' => $ticket->priority,
                    'status' => $ticket->status,
                    'customer' => $ticket->customer ? [
                        'customer_id' => $ticket->customer->customer_id,
                        'full_name' => $ticket->customer->full_name,
                    ] : null,
                    'assigned_admin' => $ticket->assignedAdmin ? [
                        'id' => $ticket->assignedAdmin->id,
                        'full_name' => $ticket->assignedAdmin->full_name,
                    ] : null,
                    'created_at' => $ticket->created_at?->toISOString(),
                    'updated_at' => $ticket->updated_at?->toISOString(),
                    'resolved_at' => $ticket->resolved_at?->toISOString(),
                ];
            }),
            'pagination' => [
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'total' => $tickets->total(),
            ],
        ]);
    }

    public function show(Request $request, SupportTicket $ticket): JsonResponse
    {
        $ticket->load(['customer', 'assignedAdmin', 'messages' => function ($q) {
            $q->latest();
        }]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'subject' => $ticket->subject,
                'description' => $ticket->description,
                'category' => $ticket->category,
                'priority' => $ticket->priority,
                'status' => $ticket->status,
                'customer' => $ticket->customer ? [
                    'customer_id' => $ticket->customer->customer_id,
                    'full_name' => $ticket->customer->full_name,
                    'email' => $ticket->customer->email,
                    'mobile' => $ticket->customer->mobile,
                ] : null,
                'assigned_admin' => $ticket->assignedAdmin ? [
                    'id' => $ticket->assignedAdmin->id,
                    'full_name' => $ticket->assignedAdmin->full_name,
                ] : null,
                'messages' => $ticket->messages->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'sender_type' => $message->sender_type,
                        'sender_name' => $message->sender_type === 'customer' 
                            ? $message->sender?->full_name 
                            : ($message->sender?->full_name ?? 'Support'),
                        'message' => $message->message,
                        'is_internal' => $message->is_internal,
                        'created_at' => $message->created_at?->toISOString(),
                    ];
                }),
                'created_at' => $ticket->created_at?->toISOString(),
                'updated_at' => $ticket->updated_at?->toISOString(),
                'resolved_at' => $ticket->resolved_at?->toISOString(),
            ],
        ]);
    }

    public function assign(Request $request, SupportTicket $ticket): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'admin_id' => 'required|exists:admins,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid admin ID.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $admin = \App\Models\Admin::findOrFail($request->admin_id);

        $ticket->update([
            'assigned_admin_id' => $admin->id,
            'status' => 'assigned',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Ticket assigned to {$admin->full_name}",
        ]);
    }

    public function updateStatus(Request $request, SupportTicket $ticket): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', \Illuminate\Validation\Rule::in(['open', 'assigned', 'in_progress', 'waiting_customer', 'resolved', 'closed'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $ticket->status;
        $ticket->update([
            'status' => $request->status,
        ]);

        if ($request->status === 'resolved') {
            $ticket->update(['resolved_at' => now()]);
        } elseif ($request->status === 'closed') {
            $ticket->update(['closed_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => "Ticket status updated to {$request->status}",
        ]);
    }

    public function addMessage(Request $request, SupportTicket $ticket): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|min:1',
            'is_internal' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Message is required.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $message = SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_type' => 'admin',
            'sender_id' => $request->user()->id,
            'message' => $request->message,
            'is_internal' => $request->boolean('is_internal', false),
        ]);

        // Update ticket status if needed
        if (in_array($ticket->status, ['open', 'waiting_customer'])) {
            $ticket->update(['status' => 'in_progress']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Message sent',
            'data' => [
                'id' => $message->id,
                'message' => $message->message,
                'is_internal' => $message->is_internal,
                'created_at' => $message->created_at?->toISOString(),
            ],
        ]);
    }
}