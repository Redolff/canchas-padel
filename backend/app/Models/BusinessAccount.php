<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessAccount extends Model
{
    protected $fillable = ['name', 'slug', 'default_slot_price'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function courts(): HasMany
    {
        return $this->hasMany(Court::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function recurringReservations(): HasMany
    {
        return $this->hasMany(RecurringReservation::class);
    }
}
