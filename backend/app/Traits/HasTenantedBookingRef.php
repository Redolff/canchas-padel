<?php

namespace App\Traits;

use App\Models\Reservation;

trait HasTenantedBookingRef
{
    protected function nextRef(): int
    {
        $max = Reservation::selectRaw("MAX(CAST(SUBSTR(booking_ref, 4) AS INTEGER)) as max_ref")
            ->value('max_ref');
        return ($max ?? 8742) + 1;
    }
}
