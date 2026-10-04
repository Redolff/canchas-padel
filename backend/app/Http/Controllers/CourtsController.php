<?php

namespace App\Http\Controllers;

use App\Http\Resources\CourtResource;
use App\Models\Court;
use Illuminate\Http\Request;

class CourtsController extends Controller
{
    public function index(Request $request)
    {
        $courts = Court::where('business_account_id', $request->user()->business_account_id)
            ->orderBy('sort_order')
            ->get();

        return CourtResource::collection($courts);
    }
}
