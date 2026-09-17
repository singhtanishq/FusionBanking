<?php

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Config;

Config::set('database.default', 'testing');
Config::set('database.connections.testing', [
    'driver' => 'sqlite',
    'database' => ':memory:',
    'prefix' => '',
]);

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Set up facade root
Facade::clearResolvedInstances();
Facade::setFacadeApplication($app);

// Run migrations for testing
$app->make('Illuminate\Contracts\Console\Kernel')->call('migrate', ['--force' => true, '--database' => 'testing']);