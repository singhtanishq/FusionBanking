<?php

namespace Tests\Support;

trait TestSetup
{
    public function setUp(): void
    {
        // Set up testing database connection
        config(['database.connections.testing' => [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]]);
        
        // Purge and reconnect
        \Illuminate\Support\Facades\DB::purge('testing');
        \Illuminate\Support\Facades\DB::reconnect('testing');
        
        // Run migrations
        $this->artisan('migrate', ['--database' => 'testing', '--force' => true]);
    }
    
    public function artisan($command, $parameters = [])
    {
        $app = require_once __DIR__.'/../bootstrap/app.php';
        $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
        return $kernel->call($command, $parameters);
    }
    
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
        return $app;
    }
}