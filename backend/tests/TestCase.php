<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

class TestCase extends BaseTestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase, \Illuminate\Foundation\Testing\WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Force the default database connection to sqlite file-based
        $this->app['config']->set('database.default', 'testing');
        $this->app['config']->set('database.connections.testing', [
            'driver' => 'sqlite',
            'database' => __DIR__ . '/../storage/testing.sqlite',
            'prefix' => '',
        ]);
        
        // Disable VACUUM for SQLite to avoid "cannot VACUUM from within a transaction" error
        $this->app['config']->set('database.connections.testing.sqlite_auto_vacuum', false);
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