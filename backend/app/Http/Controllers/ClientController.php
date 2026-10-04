<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClientResource;
use App\Http\Resources\ReservationResource;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->business_account_id;
        $search   = trim((string) $request->query('search', ''));

        $query = Client::where('business_account_id', $tenantId)
            ->withCount('reservations')
            ->orderBy('nombre');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('nombre',   'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('telefono', 'like', "%{$search}%");
            });
        }

        if ($request->has('page')) {
            $perPage   = (int) $request->query('per_page', 15);
            $paginated = $query->paginate($perPage, ['*'], 'page', (int) $request->query('page', 1));

            return response()->json([
                'data' => ClientResource::collection($paginated->items()),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'per_page'     => $paginated->perPage(),
                    'total'        => $paginated->total(),
                    'last_page'    => $paginated->lastPage(),
                    'from'         => $paginated->firstItem() ?? 0,
                    'to'           => $paginated->lastItem() ?? 0,
                ],
            ]);
        }

        return ClientResource::collection($query->get());
    }

    public function show(Request $request, Client $client)
    {
        abort_if($client->business_account_id !== $request->user()->business_account_id, 403);

        $reservations = $client->reservations()
            ->with('client')
            ->orderByDesc('booking_ref')
            ->limit(50)
            ->get();

        return response()->json([
            'client'       => new ClientResource($client->loadCount('reservations')),
            'reservations' => ReservationResource::collection($reservations),
        ]);
    }
}
