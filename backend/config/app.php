<?php

return [

    'name' => env('APP_NAME', 'FusionBanking'),

    'env' => env('APP_ENV', 'production'),

    'debug' => (bool) env('APP_DEBUG', false),

    'url' => env('APP_URL', 'http://localhost'),

    'frontend_url' => env('APP_FRONTEND_URL', 'http://localhost:5173'),
    'demo_admin_password' => env('DEMO_ADMIN_PASSWORD', 'admin123'),
    'demo_master_password' => env('DEMO_MASTER_PASSWORD', 'master123'),

    'timezone' => 'Asia/Kolkata',

    'locale' => 'en',

    'fallback_locale' => 'en',

    'faker_locale' => 'en_IN',

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];