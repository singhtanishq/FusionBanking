<?php

use Illuminate\Support\Facades\Facades;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Set up facade root
Facades::clearResolvedInstances();
Facades::setFacadeApplication($app);

// Run migrations for testing
$app->make(\Illuminate\Contracts\Console\Kernel::class)->call('migrate', ['--force' => true, '--database' => 'testing']);

// Configure database
$app['config']->set('database.default', 'testing');
$app['config']->set('database.connections.testing', [
    'driver' => 'sqlite',
    'database' => ':memory:',
    'prefix' => '',
]);