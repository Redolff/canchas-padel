<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->booking_ref,
            'bookingRef'  => $this->booking_ref,
            'courtId'     => $this->court_id,
            'date'        => $this->date,
            'startHour'   => (float) $this->start_hour,
            'duration'    => (float) $this->duration,
            'type'        => $this->type,
            'players'     => $this->players,
            'total'       => $this->total,
            'status'      => $this->status,
            'isOpen'      => (bool) $this->is_open,
            'recurringId' => $this->recurring_id,
            'clientId'    => $this->client_id,
            'clientName'  => $this->client?->nombre,
            'clientPhone' => $this->client?->telefono,
        ];
    }
}
