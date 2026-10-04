<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReservationResource;
use App\Models\Client;
use App\Models\Reservation;
use App\Traits\HasTenantedBookingRef;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    use HasTenantedBookingRef;

    public function index(Request $request)
    {
        $tenantId = $this->tenantId($request);
        $query    = Reservation::with('client')
                               ->where('business_account_id', $tenantId)
                               ->orderByDesc('booking_ref');
        $status   = $request->query('status', 'all');
        $search   = trim((string) $request->query('search', ''));
        $today    = now()->toDateString();

        if ($status === 'today') {
            $query->whereDate('date', $today);
        } elseif ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->query('date'));
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('booking_ref', 'like', "%{$search}%")
                  ->orWhereHas('client', fn($cq) => $cq->where('nombre', 'like', "%{$search}%")
                      ->orWhere('telefono', 'like', "%{$search}%"));
            });
        }

        if ($request->has('page')) {
            $perPage   = (int) $request->query('per_page', 9);
            $paginated = $query->paginate($perPage, ['*'], 'page', (int) $request->query('page', 1));

            $counts = [
                'all'      => Reservation::where('business_account_id', $tenantId)->count(),
                'today'    => Reservation::where('business_account_id', $tenantId)->whereDate('date', $today)->count(),
                'paid'     => Reservation::where('business_account_id', $tenantId)->where('status', 'paid')->count(),
                'pending'  => Reservation::where('business_account_id', $tenantId)->where('status', 'pending')->count(),
                'refunded' => Reservation::where('business_account_id', $tenantId)->where('status', 'refunded')->count(),
            ];

            return response()->json([
                'data'   => ReservationResource::collection($paginated->items()),
                'meta'   => [
                    'current_page' => $paginated->currentPage(),
                    'per_page'     => $paginated->perPage(),
                    'total'        => $paginated->total(),
                    'last_page'    => $paginated->lastPage(),
                    'from'         => $paginated->firstItem() ?? 0,
                    'to'           => $paginated->lastItem() ?? 0,
                ],
                'counts' => $counts,
            ]);
        }

        return ReservationResource::collection($query->get());
    }

    public function store(Request $request)
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'courtId'   => 'required|integer',
            'date'      => 'required|date',
            'startHour' => 'required|numeric|min:0',
            'duration'  => 'required|numeric|min:0.5',
            'type'      => 'required|in:private,open,lesson,maintenance',
            'nombre'    => 'required_unless:type,maintenance|string|nullable',
            'telefono'  => 'required_unless:type,maintenance|string|nullable',
            'players'   => 'required_unless:type,maintenance|integer|min:1|max:4|nullable',
            'isOpen'    => 'boolean',
            'total'     => 'nullable|integer|min:0',
        ]);

        $this->assertNoOverlap($tenantId, $data['courtId'], $data['date'], $data['startHour'], $data['duration']);

        $client = $this->resolveClient(
            $tenantId,
            $data['nombre'] ?? null,
            $data['telefono'] ?? null
        );

        $status = in_array(
            $data['type'],
            Reservation::revenueTypes(),
            true
        )
            ? 'pending'
            : 'paid';

        $reservation = Reservation::create([
            'business_account_id' => $tenantId,
            'booking_ref'         => 'PD-' . $this->nextRef(),
            'court_id'            => $data['courtId'],
            'date'                => $data['date'],
            'start_hour'          => $data['startHour'],
            'duration'            => $data['duration'],
            'type'                => $data['type'],
            'players'             => $data['players'] ?? 0,
            'total'               => $data['total'] ?? $request->user()->businessAccount?->default_slot_price ?? (int) round($data['duration'] * 11200),
            'status'              => $status,
            'is_open'             => $data['isOpen'] ?? false,
            'client_id'           => $client?->id,
        ]);

        $reservation->load('client');

        return new ReservationResource($reservation);
    }

    public function show(Request $request, Reservation $reservation)
    {
        abort_if($reservation->business_account_id !== $this->tenantId($request), 403);
        $reservation->load('client');
        return new ReservationResource($reservation);
    }

    public function update(Request $request, Reservation $reservation)
    {
        $tenantId = $this->tenantId($request);
        abort_if($reservation->business_account_id !== $tenantId, 403);

        $data = $request->validate([
            'courtId'   => 'required|integer',
            'date'      => 'required|date',
            'startHour' => 'required|numeric|min:0',
            'duration'  => 'required|numeric|min:0.5',
            'type'      => 'required|in:private,open,lesson,maintenance',
            'nombre'    => 'required_unless:type,maintenance|string|nullable',
            'telefono'  => 'required_unless:type,maintenance|string|nullable',
            'players'   => 'required_unless:type,maintenance|integer|min:1|max:4|nullable',
            'isOpen'    => 'boolean',
            'total'     => 'nullable|integer|min:0',
        ]);

        $this->assertNoOverlap($tenantId, $data['courtId'], $data['date'], $data['startHour'], $data['duration'], $reservation->booking_ref);

        $client = $this->resolveClient($tenantId, $data['nombre'] ?? null, $data['telefono'] ?? null);

        $status = $reservation->status;
        if (!in_array($data['type'], Reservation::revenueTypes(), true)) {
            $status = 'paid';
        };

        $reservation->update([
            'court_id'   => $data['courtId'],
            'date'       => $data['date'],
            'start_hour' => $data['startHour'],
            'duration'   => $data['duration'],
            'type'       => $data['type'],
            'status'     => $status,
            'players'    => $data['players'] ?? 0,
            'total'      => $data['total'] ?? $request->user()->businessAccount?->default_slot_price ?? (int) round($data['duration'] * 11200),
            'is_open'    => $data['isOpen'] ?? false,
            'client_id'  => $client?->id ?? $reservation->client_id
        ]);

        return new ReservationResource($reservation->fresh('client'));
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        abort_if($reservation->business_account_id !== $this->tenantId($request), 403);
        $request->validate(['status' => 'required|in:paid,pending,partial,refunded']);
        $reservation->update(['status' => $request->status]);
        return new ReservationResource($reservation);
    }

    public function destroy(Request $request, Reservation $reservation)
    {
        abort_if($reservation->business_account_id !== $this->tenantId($request), 403);
        $reservation->delete();
        return response()->noContent();
    }

    private function tenantId(Request $request): int
    {
        return $request->user()->business_account_id;
    }

    private function resolveClient(int $tenantId, ?string $nombre, ?string $telefono): ?Client
    {
        if (!$nombre || !$telefono) return null;

        return Client::firstOrCreate(
            ['business_account_id' => $tenantId, 'telefono' => $telefono],
            ['nombre' => $nombre]
        );
    }

    private function assertNoOverlap(int $tenantId, int $courtId, string $date, float $startHour, float $duration, ?string $excludeRef = null): void
    {
        $newEnd = $startHour + $duration;

        $conflict = Reservation::where('business_account_id', $tenantId)
            ->where('court_id', $courtId)
            ->where('date', $date)
            ->when($excludeRef, fn($q) => $q->where('booking_ref', '!=', $excludeRef))
            ->whereRaw('CAST(start_hour AS REAL) < CAST(? AS REAL)', [$newEnd])
            ->whereRaw('(CAST(start_hour AS REAL) + CAST(duration AS REAL)) > CAST(? AS REAL)', [$startHour])
            ->exists();

        if ($conflict) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'courtId' => ['Esta cancha ya está reservada en el horario seleccionado.'],
            ]);
        }
    }
}
