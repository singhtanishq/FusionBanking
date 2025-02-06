<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
            'master_admin' => \App\Http\Middleware\MasterAdminMiddleware::class,
            'customer' => \App\Http\Middleware\CustomerMiddleware::class,
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'throttle.api' => \App\Http\Middleware\ApiRateLimitMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                $status = $e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface
                    ? $e->getStatusCode()
                    : 500;

                // Never leak internal details (SQL, paths, stack traces) to clients.
                // Real messages are shown for user-facing HTTP errors; generic
                // message for 500s unless debug mode is explicitly enabled.
                if ($status === 500 && !config('app.debug')) {
                    $message = 'An unexpected error occurred. Please try again later.';
                } else {
                    $message = $e->getMessage() ?: ($status === 500 ? 'Server error' : 'Request failed');
                }

                $payload = [
                    'success' => false,
                    'message' => $message,
                ];

                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    $payload['errors'] = $e->errors();
                }

                return response()->json($payload, $status);
            }
        });
    })->create();