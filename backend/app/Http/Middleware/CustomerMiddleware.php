<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        if (!$request->user() instanceof \App\Models\Customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer access required',
            ], 403);
        }

        $customer = $request->user();

        if (!$customer->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is deactivated',
            ], 403);
        }

        return $next($request);
    }
}