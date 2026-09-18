<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

class TestCase extends BaseTestCase
{
    public function setUp(): void
    {
        // Set up testing database connection BEFORE parent setUp
        putenv('DB_CONNECTION=sqlite');
        putenv('DB_DATABASE=:memory:');
        
        // Force the default database connection to sqlite in-memory
        $this->app['config']->set('database.default', 'testing');
        $this->app['config']->set('database.connections.testing', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]);
        
        // Purge and reconnect
        \Illuminate\Support\Facades\DB::purge('testing');
        \Illuminate\Support\Facades\DB::reconnect('testing');
        
        // Run migrations
        $this->artisan('migrate', ['--database' => 'testing', '--force' => true]);
    }
    
    public function artisan($command, $parameters = [])
    {
        $kernel = $this->app->make(\Illuminate\Contracts\Console\Kernel::class);
        return $kernel->call($command, $parameters);
    }

    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
        return $app;
    }
}