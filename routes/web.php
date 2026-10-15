<?php

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
