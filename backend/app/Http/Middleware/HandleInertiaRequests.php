<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        // Since we're using a separate React frontend (Vite),
        // we don't need Inertia. This middleware can be empty or removed.
        return $next($request);
    }
}