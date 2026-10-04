<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecurringReservation extends Model
{
    protected $fillable = [
        'business_account_id',
        'court_id', 'start_date', 'end_date',
        'start_hour', 'duration', 'type', 'players', 'client_id',
    ];

    protected function casts(): array
    {
        return [
            'start_hour' => 'float',
            'duration'   => 'float',
            'players'    => 'integer',
        ];
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'recurring_id');
    }

    public function businessAccount(): BelongsTo
    {
        return $this->belongsTo(BusinessAccount::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
