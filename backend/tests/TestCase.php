<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Tests\CreatesApplication;

class TestCase
{
    use CreatesApplication, RefreshDatabase, WithFaker;

    public function setUp(): void
    {
        parent::setUp();
        
        // Set up testing database connection
        Config::set('database.connections.testing', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]);
        
        // Purge and reconnect
        DB::purge('testing');
        DB::reconnect('testing');
        
        // Run migrations
        $this->artisan('migrate', ['--database' => 'testing', '--force' => true]);
    }
}