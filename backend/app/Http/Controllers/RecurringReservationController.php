<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Reservation;
use App\Models\RecurringReservation;
use App\Traits\HasTenantedBookingRef;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RecurringReservationController extends Controller
{
    use HasTenantedBookingRef;

    public function store(Request $request)
    {
        $tenantId = $request->user()->business_account_id;

        $data = $request->validate([
            'courtId'   => 'required|integer',
            'startDate' => 'required|date',
            'endDate'   => 'nullable|date|after_or_equal:startDate',
            'startHour' => 'required|numeric|min:0',
            'duration'  => 'required|numeric|min:0.5',
            'type'      => 'required|in:private,open,lesson,maintenance',
            'nombre'    => 'required_unless:type,maintenance|string|nullable',
            'telefono'  => 'required_unless:type,maintenance|string|nullable',
            'players'   => 'required_unless:type,maintenance|integer|min:1|max:4|nullable',
        ]);

        $startDate = Carbon::parse($data['startDate']);
        $endDate   = isset($data['endDate']) && $data['endDate']
            ? Carbon::parse($data['endDate'])
            : $startDate->copy()->addYear();

        $dayOfWeek = $startDate->dayOfWeek;
        $newEnd    = $data['startHour'] + $data['duration'];

        $dates = [];
        $cursor = $startDate->copy();
        while ($cursor->lte($endDate)) {
            if ($cursor->dayOfWeek === $dayOfWeek) {
                $dates[] = $cursor->toDateString();
            }
            $cursor->addDay();
        }

        foreach ($dates as $date) {
            $conflict = Reservation::where('business_account_id', $tenantId)
                ->where('court_id', $data['courtId'])
                ->where('date', $date)
                ->whereRaw('CAST(start_hour AS REAL) < CAST(? AS REAL)', [$newEnd])
                ->whereRaw('(CAST(start_hour AS REAL) + CAST(duration AS REAL)) > CAST(? AS REAL)', [$data['startHour']])
                ->exists();

            if ($conflict) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'startDate' => ["La cancha ya está reservada el {$date} en ese horario."],
                ]);
            }
        }

        $client = $this->resolveClient($tenantId, $data['nombre'] ?? null, $data['telefono'] ?? null);

        $recurring = RecurringReservation::create([
            'business_account_id' => $tenantId,
            'court_id'            => $data['courtId'],
            'start_date'          => $startDate->toDateString(),
            'end_date'            => $endDate->toDateString(),
            'start_hour'          => $data['startHour'],
            'duration'            => $data['duration'],
            'type'                => $data['type'],
            'players'             => $data['players'] ?? 0,
            'client_id'           => $client?->id,
        ]);

        foreach ($dates as $date) {
            Reservation::create([
                'business_account_id' => $tenantId,
                'booking_ref'         => 'PD-' . $this->nextRef($tenantId),
                'court_id'            => $data['courtId'],
                'date'                => $date,
                'start_hour'          => $data['startHour'],
                'duration'            => $data['duration'],
                'type'                => $data['type'],
                'players'             => $data['players'] ?? 0,
                'total'               => (int) round($data['duration'] * 11200),
                'status'              => 'pending',
                'is_open'             => $data['type'] === 'open',
                'recurring_id'        => $recurring->id,
                'client_id'           => $client?->id,
            ]);
        }

        return response()->json([
            'count'     => count($dates),
            'startDate' => $startDate->toDateString(),
            'endDate'   => $endDate->toDateString(),
        ], 201);
    }

    public function destroy(Request $request, RecurringReservation $recurringReservation)
    {
        abort_if($recurringReservation->business_account_id !== $request->user()->business_account_id, 403);
        $recurringReservation->reservations()->delete();
        $recurringReservation->delete();
        return response()->noContent();
    }

    private function resolveClient(int $tenantId, ?string $nombre, ?string $telefono): ?Client
    {
        if (!$nombre || !$telefono) return null;

        return Client::firstOrCreate(
            ['business_account_id' => $tenantId, 'telefono' => $telefono],
            ['nombre' => $nombre]
        );
    }
}
