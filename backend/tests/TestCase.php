<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

class TestCase extends BaseTestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase, \Illuminate\Foundation\Testing\WithFaker;

    public function setUp(): void
    {
        parent::setUp();
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