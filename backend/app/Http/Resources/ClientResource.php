<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'nombre'            => $this->nombre,
            'apellido'          => $this->apellido,
            'telefono'          => $this->telefono,
            'dni'               => $this->dni,
            'reservationsCount' => (int) ($this->reservations_count ?? 0),
        ];
    }
}
