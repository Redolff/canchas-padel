<?php

namespace Database\Seeders;

use App\Models\BusinessAccount;
use App\Models\Court;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Tenant 1: Padel Center Buenos Aires ──────────────────────────
        $ba1 = BusinessAccount::firstOrCreate(
            ['slug' => 'padel-center-ba'],
            ['name' => 'Padel Center Buenos Aires']
        );

        $courts1 = $this->seedCourts($ba1->id, [
            ['name' => 'Cancha 1', 'surface' => 'turf', 'location' => 'Indoor',  'has_glass' => false, 'sort_order' => 1],
            ['name' => 'Cancha 2', 'surface' => 'clay', 'location' => 'Indoor',  'has_glass' => false, 'sort_order' => 2],
            ['name' => 'Cancha 3', 'surface' => 'blue', 'location' => 'Indoor',  'has_glass' => true,  'sort_order' => 3],
            ['name' => 'Cancha 4', 'surface' => 'turf', 'location' => 'Indoor',  'has_glass' => false, 'sort_order' => 4],
            ['name' => 'Cancha 5', 'surface' => 'turf', 'location' => 'Indoor',  'has_glass' => false, 'sort_order' => 5],
            ['name' => 'Cancha 6', 'surface' => 'clay', 'location' => 'Outdoor', 'has_glass' => false, 'sort_order' => 6],
            ['name' => 'Cancha 7', 'surface' => 'turf', 'location' => 'Outdoor', 'has_glass' => false, 'sort_order' => 7],
            ['name' => 'Cancha 8', 'surface' => 'blue', 'location' => 'Outdoor', 'has_glass' => true,  'sort_order' => 8],
        ]);

        $user1 = User::firstOrCreate(
            ['email' => 'diego@padelcenter.com.ar'],
            [
                'name'                => 'Diego Manager',
                'password'            => Hash::make('admin123'),
                'business_account_id' => $ba1->id,
                'role'                => 'owner',
            ]
        );
        // Backfill if user existed before multi-tenancy
        if (!$user1->business_account_id) {
            $user1->update(['business_account_id' => $ba1->id, 'role' => 'owner']);
        }

        $this->call(ReservationSeeder::class, false, [
            'businessAccountId' => $ba1->id,
            'courtIds'          => $courts1,
        ]);

        // ── Tenant 2: Club Náutico Palermo ───────────────────────────────
        $ba2 = BusinessAccount::firstOrCreate(
            ['slug' => 'club-nautico-palermo'],
            ['name' => 'Club Náutico Palermo']
        );

        $courts2 = $this->seedCourts($ba2->id, [
            ['name' => 'Cancha A', 'surface' => 'turf', 'location' => 'Indoor',  'has_glass' => false, 'sort_order' => 1],
            ['name' => 'Cancha B', 'surface' => 'turf', 'location' => 'Indoor',  'has_glass' => false, 'sort_order' => 2],
            ['name' => 'Cancha C', 'surface' => 'clay', 'location' => 'Outdoor', 'has_glass' => false, 'sort_order' => 3],
            ['name' => 'Cancha D', 'surface' => 'clay', 'location' => 'Outdoor', 'has_glass' => false, 'sort_order' => 4],
        ]);

        User::firstOrCreate(
            ['email' => 'admin@nautico.com.ar'],
            [
                'name'                => 'Admin Náutico',
                'password'            => Hash::make('admin123'),
                'business_account_id' => $ba2->id,
                'role'                => 'owner',
            ]
        );

        $this->call(NauticoReservationSeeder::class, false, [
            'businessAccountId' => $ba2->id,
            'courtIds'          => $courts2,
        ]);
    }

    private function seedCourts(int $businessAccountId, array $courts): array
    {
        $ids = [];
        foreach ($courts as $court) {
            $existing = Court::where('business_account_id', $businessAccountId)
                ->where('name', $court['name'])
                ->first();
            if ($existing) {
                $ids[] = $existing->id;
            } else {
                $ids[] = Court::create(array_merge($court, ['business_account_id' => $businessAccountId]))->id;
            }
        }
        return $ids;
    }
}
