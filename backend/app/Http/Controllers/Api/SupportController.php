<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SupportController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $customer = $request->user();
        $tickets = SupportTicket::where('customer_id', $customer->id)
            ->latest()
            ->paginate($request->get('per_page', 20));

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

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|min:5|max:255',
            'description' => 'required|string|min:20',
            'category' => ['required', \Illuminate\Validation\Rule::in(['general', 'account', 'transfer', 'loan', 'fd', 'kyc', 'technical', 'security', 'other'])],
            'priority' => ['nullable', \Illuminate\Validation\Rule::in(['low', 'normal', 'high', 'urgent'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $ticket = SupportTicket::create([
            'ticket_number' => 'TKT' . now()->format('Ymd') . strtoupper(\Illuminate\Support\Str::random(6)),
            'customer_id' => $request->user()->id,
            'subject' => $request->subject,
            'description' => $request->description,
            'category' => $request->category,
            'priority' => $request->priority ?? 'normal',
            'status' => 'open',
        ]);

        // Create initial message from customer
        SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_type' => 'customer',
            'sender_id' => $request->user()->id,
            'message' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Support ticket created successfully',
            'data' => [
                'ticket_number' => $ticket->ticket_number,
                'status' => $ticket->status,
            ],
        ], 201);
    }

    public function show(Request $request, SupportTicket $ticket): JsonResponse
    {
        if ($ticket->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found',
            ], 404);
        }

        $ticket->load(['messages' => function ($q) {
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
                'created_at' => $ticket->created_at?->toISOString(),
                'updated_at' => $ticket->updated_at?->toISOString(),
                'resolved_at' => $ticket->resolved_at?->toISOString(),
                'messages' => $ticket->messages->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'sender_type' => $message->sender_type,
                        'sender_name' => $message->sender_type === 'customer' ? 'You' : 'Support',
                        'message' => $message->message,
                        'is_internal' => $message->is_internal,
                        'created_at' => $message->created_at?->toISOString(),
                    ];
                }),
            ],
        ]);
    }

    public function addMessage(Request $request, SupportTicket $ticket): JsonResponse
    {
        if ($ticket->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found',
            ], 404);
        }

        if (!in_array($ticket->status, ['open', 'assigned', 'in_progress', 'waiting_customer'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add message to closed ticket',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'message' => 'required|string|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a message.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $message = SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_type' => 'customer',
            'sender_id' => $request->user()->id,
            'message' => $request->message,
        ]);

        // Update ticket status to waiting_customer if it was in_progress or assigned
        if (in_array($ticket->status, ['assigned', 'in_progress'])) {
            $ticket->update(['status' => 'waiting_customer']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Message sent',
            'data' => [
                'id' => $message->id,
                'message' => $message->message,
                'created_at' => $message->created_at?->toISOString(),
            ],
        ]);
    }
}