<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CourtsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RecurringReservationController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/courts', [CourtsController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/clients',          [ClientController::class, 'index']);
    Route::get('/clients/{client}', [ClientController::class, 'show']);

    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);
    Route::apiResource('reservations', ReservationController::class);

    Route::post('/recurring-reservations', [RecurringReservationController::class, 'store']);
    Route::delete('/recurring-reservations/{recurringReservation}', [RecurringReservationController::class, 'destroy']);
});
