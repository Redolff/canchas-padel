<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourtResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'name'     => $this->name,
            'surface'  => $this->surface,
            'location' => $this->location,
            'hasGlass' => $this->has_glass,
            'sortOrder' => $this->sort_order,
        ];
    }
}
