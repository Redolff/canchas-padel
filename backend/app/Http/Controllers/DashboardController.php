<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReservationResource;
use App\Models\Court;
use App\Models\Reservation;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $tenantId  = $request->user()->business_account_id;
        $today     = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        $q = fn() => Reservation::where('business_account_id', $tenantId);

        // Bookings
        $todayBookings     = $q()->whereDate('date', $today)->count();
        $yesterdayBookings = $q()->whereDate('date', $yesterday)->count();

        // Revenue (paid + partial)
        $todayRevenue     = (int) $q()->whereDate('date', $today)->whereIn('status', ['paid', 'partial'])->whereIn('type', Reservation::revenueTypes())->sum('total');
        $yesterdayRevenue = (int) $q()->whereDate('date', $yesterday)->whereIn('status', ['paid', 'partial'])->whereIn('type', Reservation::revenueTypes())->sum('total');

        // Occupancy
        $courtsCount  = Court::where('business_account_id', $tenantId)->count();
        $capacity     = max(1, $courtsCount * 14);
        $todayHours   = (float) $q()->whereDate('date', $today)->where('type', '!=', 'maintenance')->sum('duration');
        $yestHours    = (float) $q()->whereDate('date', $yesterday)->where('type', '!=', 'maintenance')->sum('duration');
        $todayOcc     = $courtsCount > 0 ? (int) round($todayHours / $capacity * 100) : 0;
        $yestOcc      = $courtsCount > 0 ? (int) round($yestHours / $capacity * 100) : 0;

        // Active members — unique clients per 30-day window
        $monthStart     = now()->subDays(29)->toDateString();
        $prevMonthEnd   = now()->subDays(30)->toDateString();
        $prevMonthStart = now()->subDays(59)->toDateString();

        $activeMembers = $q()->whereBetween('date', [$monthStart, $today])
            ->selectRaw('COUNT(DISTINCT client_id) as cnt')->value('cnt') ?? 0;
        $prevMembers   = $q()->whereBetween('date', [$prevMonthStart, $prevMonthEnd])
            ->selectRaw('COUNT(DISTINCT client_id) as cnt')->value('cnt') ?? 0;

        // Upcoming: next 5 that haven't started yet (UTC)
        $now         = now();
        $currentHour = (float) ($now->hour + $now->minute / 60);

        $upcoming = $q()
            ->with('client')
            ->where('date', $today)
            ->whereRaw('CAST(start_hour AS REAL) >= CAST(? AS REAL)', [$currentHour])
            ->orderBy('date')
            ->orderBy('start_hour')
            ->limit(5)
            ->get();

        return response()->json([
            'todayBookings'  => $todayBookings,
            'bookingsDelta'  => $todayBookings - $yesterdayBookings,
            'todayRevenue'   => $todayRevenue,
            'revenueDelta'   => $todayRevenue - $yesterdayRevenue,
            'occupancy'      => $todayOcc,
            'occupancyDelta' => $todayOcc - $yestOcc,
            'activeMembers'  => (int) $activeMembers,
            'membersDelta'   => (int) $activeMembers - (int) $prevMembers,
            'upcoming'       => ReservationResource::collection($upcoming),
        ]);
    }
}
