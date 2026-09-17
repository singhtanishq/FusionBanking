<?php

use Illuminate\Support\Facades\Route;

// Web routes for admin panel (if using Inertia/Livewire)
// For now, just redirect to frontend
Route::get('/{any}', function () {
    return redirect(config('app.frontend_url') . '/' . request()->path());
})->where('any', '.*');