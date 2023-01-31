<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transfer;
use App\Models\BankAccount;
use App\Models\Customer;
use App\Services\TransferService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TransferController extends Controller
{
    protected TransferService $transferService;

    public function __construct(TransferService $transferService)
    {
        $this->transferService = $transferService;
    }

    public function validateRecipient(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'account_number' => 'required|string|min:12|max:20',
            'ifsc' => 'required|string|min:8|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide valid account details.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $receiverAccount = $this->transferService->validateRecipient(
            $request->account_number,
            strtoupper($request->ifsc)
        );

        if (!$receiverAccount) {
            return response()->json([
                'success' => false,
                'message' => 'Account not found or not eligible to receive transfers',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Recipient validated',
            'data' => [
                'name' => $receiverAccount->customer->full_name,
                'account_number' => $receiverAccount->account_number,
                'ifsc' => $receiverAccount->ifsc_code,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $customer = $request->user();
        $senderAccount = $customer->primaryAccount;

        if (!$senderAccount) {
            return response()->json([
                'success' => false,
                'message' => 'No active account found',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'recipient_account_number' => 'required|string|min:12|max:20',
            'recipient_ifsc' => 'required|string|min:8|max:15',
            'amount' => 'required|numeric|min:1|max:200000',
            'remark' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $transfer = $this->transferService->initiateTransfer(
                $customer,
                $senderAccount,
                $request->recipient_account_number,
                strtoupper($request->recipient_ifsc),
                $request->amount,
                $request->remark ?? '',
                $request->header('Idempotency-Key')
            );

            $verificationToken = \App\Models\VerificationToken::where('resource_type', \App\Models\Transfer::class)
                ->where('resource_id', $transfer->id)
                ->where('purpose', \App\Enums\VerificationPurpose::TRANSFER_VERIFICATION)
                ->latest()
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Transfer initiated. Verification code sent to your email.',
                'data' => [
                    'transfer_id' => $transfer->id,
                    'reference_number' => $transfer->reference_number,
                    'status' => $transfer->status->value,
                    'requires_otp' => true,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'transfer_id' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide valid verification details.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $transfer = \App\Models\Transfer::findOrFail($request->transfer_id);
            $customer = $request->user();

            if ($transfer->sender_customer_id !== $customer->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $this->transferService->executeTransfer($transfer, $request->otp);

            return response()->json([
                'success' => true,
                'message' => 'Transfer completed successfully',
                'data' => [
                    'transfer_id' => $transfer->id,
                    'reference_number' => $transfer->reference_number,
                    'status' => $transfer->status->value,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $customer = $request->user();
        $transfers = Transfer::where('sender_customer_id', $customer->id)
            ->orWhere('receiver_customer_id', $customer->id)
            ->with(['senderAccount', 'receiverAccount', 'senderCustomer', 'receiverCustomer'])
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $transfers->map(function ($transfer) use ($customer) {
                return [
                    'id' => $transfer->id,
                    'reference_number' => $transfer->reference_number,
                    'amount' => $transfer->amount,
                    'fee' => $transfer->fee,
                    'total_debit' => $transfer->total_debit,
                    'transfer_type' => $transfer->transfer_type,
                    'remark' => $transfer->remark,
                    'status' => $transfer->status->value,
                    'sender_name' => $transfer->senderCustomer->full_name,
                    'sender_account' => $transfer->senderAccount->getMaskedAccountNumber(),
                    'receiver_name' => $transfer->receiverCustomer->full_name,
                    'receiver_account' => $transfer->receiverAccount->getMaskedAccountNumber(),
                    'is_sender' => $transfer->sender_customer_id === $customer->id,
                    'created_at' => $transfer->created_at?->toISOString(),
                    'processed_at' => $transfer->processed_at?->toISOString(),
                ];
            }),
            'pagination' => [
                'current_page' => $transfers->currentPage(),
                'last_page' => $transfers->lastPage(),
                'total' => $transfers->total(),
            ],
        ]);
    }

    public function show(Request $request, Transfer $transfer): JsonResponse
    {
        $customer = $request->user();

        if ($transfer->sender_customer_id !== $customer->id && $transfer->receiver_customer_id !== $customer->id) {
            return response()->json([
                'success' => false,
                'message' => 'Transfer not found',
            ], 404);
        }

        $transfer->load(['senderAccount', 'receiverAccount', 'senderCustomer', 'receiverCustomer']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $transfer->id,
                'reference_number' => $transfer->reference_number,
                'amount' => $transfer->amount,
                'fee' => $transfer->fee,
                'total_debit' => $transfer->total_debit,
                'transfer_type' => $transfer->transfer_type,
                'remark' => $transfer->remark,
                'status' => $transfer->status->value,
                'sender' => [
                    'name' => $transfer->senderCustomer->full_name,
                    'account' => $transfer->senderAccount->getMaskedAccountNumber(),
                ],
                'receiver' => [
                    'name' => $transfer->receiverCustomer->full_name,
                    'account' => $transfer->receiverAccount->getMaskedAccountNumber(),
                ],
                'is_sender' => $transfer->sender_customer_id === $customer->id,
                'created_at' => $transfer->created_at?->toISOString(),
                'verified_at' => $transfer->verified_at?->toISOString(),
                'processed_at' => $transfer->processed_at?->toISOString(),
                'failed_at' => $transfer->failed_at?->toISOString(),
                'failure_reason' => $transfer->failure_reason,
            ],
        ]);
    }
}