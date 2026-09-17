<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuditController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = AuditLog::latest();

        if ($request->has('actor_type') && $request->actor_type) {
            $query->where('actor_type', $request->actor_type);
        }

        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        if ($request->has('resource_type') && $request->resource_type) {
            $query->where('resource_type', $request->resource_type);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $audits = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $audits->map(function ($audit) {
                return [
                    'id' => $audit->id,
                    'actor_type' => $audit->actor_type,
                    'actor_id' => $audit->actor_id,
                    'action' => $audit->action,
                    'resource_type' => $audit->resource_type,
                    'resource_id' => $audit->resource_id,
                    'ip_address' => $audit->ip_address,
                    'created_at' => $audit->created_at?->toISOString(),
                    'old_values' => $audit->old_values,
                    'new_values' => $audit->new_values,
                ];
            }),
            'pagination' => [
                'current_page' => $audits->currentPage(),
                'last_page' => $audits->lastPage(),
                'total' => $audits->total(),
            ],
        ]);
    }

    public function show(Request $request, \App\Models\AuditLog $audit): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $audit->id,
                'actor_type' => $audit->actor_type,
                'actor_id' => $audit->actor_id,
                'action' => $audit->action,
                'resource_type' => $audit->resource_type,
                'resource_id' => $audit->resource_id,
                'ip_address' => $audit->ip_address,
                'user_agent' => $audit->user_agent,
                'old_values' => $audit->old_values,
                'new_values' => $audit->new_values,
                'metadata' => $audit->metadata,
                'created_at' => $audit->created_at?->toISOString(),
            ],
        ]);
    }
}