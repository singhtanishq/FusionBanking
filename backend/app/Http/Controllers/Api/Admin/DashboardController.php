<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\BankAccount;
use App\Models\Application;
use App\Models\Loan;
use App\Models\FixedDeposit;
use App\Models\Transaction;
use App\Models\Transfer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        $stats = [
            'total_customers' => Customer::count(),
            'pending_applications' => Application::where('status', '!=', \App\Enums\ApplicationStatus::REJECTED)
                ->where('status', '!=', \App\Enums\ApplicationStatus::ACCOUNT_ACTIVE)
                ->where('status', '!=', \App\Enums\ApplicationStatus::APPROVED)
                ->count(),
            'pending_kyc' => Application::whereHas('steps', function ($q) {
                $q->where('step_key', 'kyc_info')
                  ->where('status', '!=', \App\Enums\ApplicationStepStatus::VERIFIED);
            })->count(),
            'active_accounts' => BankAccount::where('status', \App\Enums\AccountStatus::ACTIVE)->count(),
            'loans_pending_review' => Loan::where('status', \App\Enums\LoanStatus::UNDER_REVIEW)->count(),
            'loans_disbursed' => Loan::where('status', \App\Enums\LoanStatus::DISBURSED)->count(),
            'total_deposits' => BankAccount::where('status', \App\Enums\AccountStatus::ACTIVE)->sum('balance'),
            'transactions_today' => Transaction::whereDate('created_at', $today)->count(),
            'transfers_today' => Transfer::whereDate('created_at', $today)->count(),
            'fd_value' => FixedDeposit::where('status', \App\Enums\FDStatus::ACTIVE)->sum('principal_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    public function recentActivity(Request $request): JsonResponse
    {
        $applications = \App\Models\Application::with('customer')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'type' => 'application',
                    'action' => 'Application ' . $app->status->value,
                    'description' => "Application {$app->acknowledgement_number} for {$app->personalInfo?->full_name}",
                    'created_at' => $app->created_at?->toISOString(),
                    'actor_name' => $app->customer?->full_name ?? 'System',
                ];
            });

        $loanActivities = \App\Models\Loan::with('customer')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'type' => 'loan',
                    'action' => 'Loan ' . $loan->status->value,
                    'description' => "Loan {$loan->loan_number} for {$loan->customer?->full_name}",
                    'created_at' => $loan->created_at?->toISOString(),
                    'actor_name' => $loan->customer?->full_name ?? 'System',
                ];
            });

        $recentActivities = $applications->merge($loanActivities)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return response()->json([
            'success' => true,
            'data' => $recentActivities,
        ]);
    }
}