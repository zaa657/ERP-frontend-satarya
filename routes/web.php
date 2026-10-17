<?php

use App\Http\Controllers\N8nNotificationController;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('erp');
})->name('erp');

Route::get('/owner', function () {
    return view('erp', ['loginRole' => 'owner']);
})->name('login.owner');

Route::get('/admin', function () {
    return view('erp', ['loginRole' => 'admin']);
})->name('login.admin');

Route::post('/notify-n8n', [N8nNotificationController::class, 'send'])
    ->withoutMiddleware([PreventRequestForgery::class, ValidateCsrfToken::class])
    ->name('n8n.notify');
