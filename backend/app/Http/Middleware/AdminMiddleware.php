<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        if (!$request->user() instanceof \App\Models\Admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin access required',
            ], 403);
        }

        $admin = $request->user();

        if (!$admin->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Admin account is deactivated',
            ], 403);
        }

        return $next($request);
    }
}