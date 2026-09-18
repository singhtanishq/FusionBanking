<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Configure database first
$app['config']->set('database.default', 'testing');
$app['config']->set('database.connections.testing', [
    'driver' => 'sqlite',
    'database' => ':memory:',
    'prefix' => '',
]);

// Set up facade root
\Illuminate\Support\Facades\Facade::clearResolvedInstances();
\Illuminate\Support\Facades\Facade::setFacadeApplication($app);

// Run migrations for testing
$app->make('Illuminate\Contracts\Console\Kernel')->call('migrate', ['--force' => true, '--database' => 'testing']);