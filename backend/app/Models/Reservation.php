<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'business_account_id',
        'booking_ref', 'court_id', 'date', 'start_hour', 'duration',
        'type', 'players', 'total', 'status', 'is_open', 'recurring_id', 'client_id',
    ];

    protected function casts(): array
    {
        return [
            'start_hour' => 'float',
            'duration'   => 'float',
            'is_open'    => 'boolean',
            'total'      => 'integer',
            'players'    => 'integer',
        ];
    }

    public const REVENUE_TYPES = [
        'private',
        'open',
    ];

    public static function revenueTypes(): array {
        return self::REVENUE_TYPES;
    }

    public function generatesRevenue(): bool {
        return in_array($this->type, self::REVENUE_TYPES, true);
    }

    public function getRouteKeyName(): string
    {
        return 'booking_ref';
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
