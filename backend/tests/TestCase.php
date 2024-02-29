<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class TestCase extends \Illuminate\Foundation\Testing\TestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase, \Illuminate\Foundation\Testing\WithFaker;

    public function setUp(): void
    {
        parent::setUp();
        
        // Set up testing database connection
        Config::set('database.connections.testing', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]);
        Config::set('database.default', 'testing');
        
        // Purge and reconnect
        DB::purge('testing');
        DB::reconnect('testing');
        
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