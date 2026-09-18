<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure the storage directory exists
        $storagePath = __DIR__ . '/../storage';
        if (!is_dir($storagePath)) {
            mkdir($storagePath, 0755, true);
        }
        
        // Force the default database connection to sqlite file-based
        $this->app['config']->set('database.default', 'testing');
        $this->app['config']->set('database.connections.testing', [
            'driver' => 'sqlite',
            'database' => __DIR__ . '/../storage/testing.sqlite',
            'prefix' => '',
        ]);
        
        // Ensure the sqlite file exists
        $dbPath = __DIR__ . '/../storage/testing.sqlite';
        if (!file_exists($dbPath)) {
            touch($dbPath);
        }
    }
    
    protected function tearDown(): void
    {
        // Clear the database after each test - only truncate existing tables
        if (config('database.default') === 'testing') {
            try {
                $tables = \Illuminate\Support\Facades\DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations'");
                foreach ($tables as $table) {
                    \Illuminate\Support\Facades\DB::statement("DELETE FROM {$table->name}");
                }
            } catch (\Exception $e) {
                // Ignore cleanup errors
            }
        }
        parent::tearDown();
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
        
        // Run migrations for the file-based database
        $app->make('Illuminate\Contracts\Console\Kernel')->call('migrate', ['--force' => true, '--database' => 'testing']);
        
        return $app;
    }
}