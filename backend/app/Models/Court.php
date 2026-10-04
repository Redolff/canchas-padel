<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Court extends Model
{
    protected $fillable = ['business_account_id', 'name', 'surface', 'location', 'has_glass', 'sort_order'];

    protected function casts(): array
    {
        return [
            'has_glass'  => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function businessAccount(): BelongsTo
    {
        return $this->belongsTo(BusinessAccount::class);
    }
}
