<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Reservation;
use Illuminate\Database\Seeder;

class NauticoReservationSeeder extends Seeder
{
    public function run(int $businessAccountId, array $courtIds): void
    {
        if (Reservation::where('business_account_id', $businessAccountId)->count() > 0) return;

        $today     = '2026-05-25';
        $yesterday = '2026-05-24';

        $c = $courtIds;

        $clientData = [
            ['nombre' => 'Ignacio Paz',      'telefono' => '1142000001'],
            ['nombre' => 'Florencia Ríos',   'telefono' => '1142000002'],
            ['nombre' => 'Bruno Salinas',    'telefono' => '1142000003'],
            ['nombre' => 'Coach Navarro',    'telefono' => '1142000004'],
            ['nombre' => 'Valentín Oses',    'telefono' => '1142000005'],
            ['nombre' => 'Renata Blanco',    'telefono' => '1142000006'],
            ['nombre' => 'Esteban Fuentes',  'telefono' => '1142000007'],
            ['nombre' => 'Cecilia Ríos',     'telefono' => '1142000008'],
            ['nombre' => 'Maximiliano Vera', 'telefono' => '1142000009'],
            ['nombre' => 'Adriana Mendez',   'telefono' => '1142000010'],
        ];

        $clients = [];
        foreach ($clientData as $cd) {
            $client = Client::firstOrCreate(
                ['business_account_id' => $businessAccountId, 'telefono' => $cd['telefono']],
                ['nombre' => $cd['nombre']]
            );
            $clients[$cd['telefono']] = $client->id;
        }

        $cid = fn(string $phone) => $clients[$phone];

        Reservation::insertOrIgnore([
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-1001','court_id'=>$c[0],'date'=>$today,    'start_hour'=>17,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1142000001'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-1002','court_id'=>$c[1],'date'=>$today,    'start_hour'=>18,  'duration'=>1.5,'type'=>'open',   'client_id'=>$cid('1142000002'),'players'=>3,'total'=>16800,'status'=>'pending', 'is_open'=>true, 'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-1003','court_id'=>$c[2],'date'=>$today,    'start_hour'=>19,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1142000003'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-1004','court_id'=>$c[3],'date'=>$today,    'start_hour'=>20,  'duration'=>2,  'type'=>'lesson', 'client_id'=>$cid('1142000004'),'players'=>4,'total'=>22400,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-1005','court_id'=>$c[0],'date'=>$yesterday,'start_hour'=>16,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1142000005'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-1006','court_id'=>$c[1],'date'=>$yesterday,'start_hour'=>17.5,'duration'=>1.5,'type'=>'private','client_id'=>$cid('1142000006'),'players'=>4,'total'=>16800,'status'=>'partial', 'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-1007','court_id'=>$c[2],'date'=>$yesterday,'start_hour'=>19,  'duration'=>1.5,'type'=>'open',   'client_id'=>$cid('1142000007'),'players'=>2,'total'=>16800,'status'=>'pending', 'is_open'=>true, 'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-1008','court_id'=>$c[3],'date'=>$yesterday,'start_hour'=>21,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1142000008'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-1009','court_id'=>$c[0],'date'=>$yesterday,'start_hour'=>22.5,'duration'=>1.5,'type'=>'private','client_id'=>$cid('1142000009'),'players'=>4,'total'=>16800,'status'=>'refunded','is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-1010','court_id'=>$c[1],'date'=>$yesterday,'start_hour'=>15,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1142000010'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
        ]);
    }
}
