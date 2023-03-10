<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\BankAccount;
use App\Models\Transaction;
use App\Models\Loan;
use App\Models\FixedDeposit;
use App\Models\Application;
use App\Models\KycDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Customer::with(['primaryAccount', 'primaryAccount.transactions'])
            ->latest();

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('customer_id', 'like', "%{$request->search}%")
                  ->orWhere('full_name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('mobile', 'like', "%{$request->search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('is_active', $request->boolean('status'));
        }

        $customers = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $customers->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'customer_id' => $customer->customer_id,
                    'full_name' => $customer->full_name,
                    'email' => $customer->email,
                    'mobile' => $customer->mobile,
                    'is_active' => $customer->is_active,
                    'kyc_verified_at' => $customer->kyc_verified_at?->toISOString(),
                    'netbanking_activated_at' => $customer->netbanking_activated_at?->toISOString(),
                    'created_at' => $customer->created_at?->toISOString(),
                    'primary_account' => $customer->primaryAccount ? [
                        'account_number' => $customer->primaryAccount->account_number,
                        'status' => $customer->primaryAccount->status->value,
                        'balance' => $customer->primaryAccount->balance,
                    ] : null,
                ];
            }),
            'pagination' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    public function show(Request $request, Customer $customer): JsonResponse
    {
        $customer->load([
            'addresses',
            'primaryAccount',
            'accounts.transactions' => function ($q) { $q->latest()->limit(10); },
            'loans' => function ($q) { $q->with('product'); },
            'fixedDeposits' => function ($q) { $q->with('product'); },
            'applications' => function ($q) { $q->with('steps'); },
            'kycDocuments',
            'beneficiaries',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $customer->id,
                'customer_id' => $customer->customer_id,
                'email' => $customer->email,
                'mobile' => $customer->mobile,
                'alternate_mobile' => $customer->alternate_mobile,
                'full_name' => $customer->full_name,
                'father_name' => $customer->father_name,
                'mother_name' => $customer->mother_name,
                'date_of_birth' => $customer->date_of_birth?->toDateString(),
                'gender' => $customer->gender,
                'marital_status' => $customer->marital_status,
                'nationality' => $customer->nationality,
                'occupation' => $customer->occupation,
                'annual_income' => $customer->annual_income,
                'pan_number' => $customer->pan_number,
                'aadhaar_number' => $customer->aadhaar_number,
                'kyc_type' => $customer->kyc_type,
                'kyc_verified_at' => $customer->kyc_verified_at?->toISOString(),
                'netbanking_activated_at' => $customer->netbanking_activated_at?->toISOString(),
                'last_login_at' => $customer->last_login_at?->toISOString(),
                'is_active' => $customer->is_active,
                'created_at' => $customer->created_at?->toISOString(),
                'addresses' => $customer->addresses->map(function ($addr) {
                    return [
                        'type' => $addr->type,
                        'address_line_1' => $addr->address_line_1,
                        'address_line_2' => $addr->address_line_2,
                        'city' => $addr->city,
                        'state' => $addr->state,
                        'postal_code' => $addr->postal_code,
                        'country' => $addr->country,
                        'landmark' => $addr->landmark,
                        'is_primary' => $addr->is_primary,
                        'is_verified' => $addr->is_verified,
                    ];
                }),
                'accounts' => $customer->accounts->map(function ($acc) {
                    return [
                        'id' => $acc->id,
                        'account_number' => $acc->account_number,
                        'account_type' => $acc->account_type,
                        'status' => $acc->status->value,
                        'balance' => $acc->balance,
                        'available_balance' => $acc->available_balance,
                        'ifsc_code' => $acc->ifsc_code,
                        'opening_date' => $acc->opening_date?->toDateString(),
                        'is_primary' => $acc->is_primary,
                    ];
                }),
                'transactions' => $customer->primaryAccount?->transactions?->map(function ($txn) {
                    return [
                        'reference_number' => $txn->reference_number,
                        'type' => $txn->type->value,
                        'direction' => $txn->direction,
                        'amount' => $txn->amount,
                        'description' => $txn->description,
                        'created_at' => $txn->created_at?->toISOString(),
                        'closing_balance' => $txn->closing_balance,
                    ];
                }) ?? [],
                'loans' => $customer->loans->map(function ($loan) {
                    return [
                        'loan_number' => $loan->loan_number,
                        'status' => $loan->status->value,
                        'principal_amount' => $loan->principal_amount,
                        'approved_amount' => $loan->approved_amount,
                        'emi' => $loan->emi,
                    ];
                }),
                'fixed_deposits' => $customer->fixedDeposits->map(function ($fd) {
                    return [
                        'fd_number' => $fd->fd_number,
                        'status' => $fd->status->value,
                        'principal_amount' => $fd->principal_amount,
                        'maturity_amount' => $fd->maturity_amount,
                        'maturity_date' => $fd->maturity_date?->toDateString(),
                    ];
                }),
                'applications' => $customer->applications->map(function ($app) {
                    return [
                        'acknowledgement_number' => $app->acknowledgement_number,
                        'status' => $app->status->value,
                        'submitted_at' => $app->submitted_at?->toISOString(),
                    ];
                }),
            ],
        ]);
    }

    public function restrict(Request $request, Customer $customer): JsonResponse
    {
        $customer->update([
            'is_active' => false,
        ]);

        \App\Models\AuditLog::log(
            'customer_restricted',
            'customer',
            $customer->id,
            $request->user(),
            ['is_active' => true],
            ['is_active' => false]
        );

        return response()->json([
            'success' => true,
            'message' => 'Customer restricted',
        ]);
    }

    public function unrestrict(Request $request, Customer $customer): JsonResponse
    {
        $customer->update([
            'is_active' => true,
        ]);

        \App\Models\AuditLog::log(
            'customer_unrestricted',
            'customer',
            $customer->id,
            $request->user(),
            ['is_active' => false],
            ['is_active' => true]
        );

        return response()->json([
            'success' => true,
            'message' => 'Customer unrestricted',
        ]);
    }
}