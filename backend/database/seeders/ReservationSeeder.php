<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Reservation;
use Illuminate\Database\Seeder;

class ReservationSeeder extends Seeder
{
    public function run(int $businessAccountId, array $courtIds): void
    {
        if (Reservation::where('business_account_id', $businessAccountId)->count() > 0) return;

        $today     = '2026-05-25';
        $yesterday = '2026-05-24';
        $day22     = '2026-05-23';
        $day21     = '2026-05-22';

        $c = $courtIds;

        // Create clients (findOrCreate by phone per tenant)
        $clients = [];
        $clientData = [
            ['nombre' => 'Mateo Diaz',           'telefono' => '1141000001'],
            ['nombre' => 'Sofia Vega',            'telefono' => '1141000002'],
            ['nombre' => 'Lucia Romero',          'telefono' => '1141000003'],
            ['nombre' => 'Camila Torres',         'telefono' => '1141000004'],
            ['nombre' => 'Federico Solé',         'telefono' => '1141000005'],
            ['nombre' => 'Daniel Sosa',           'telefono' => '1141000006'],
            ['nombre' => 'Marina Pereyra',        'telefono' => '1141000007'],
            ['nombre' => 'Joaquín Pérez',         'telefono' => '1141000008'],
            ['nombre' => 'Valentina Ruiz',        'telefono' => '1141000009'],
            ['nombre' => 'Gabriel Ferreyra',      'telefono' => '1141000010'],
            ['nombre' => 'Coach Galván',          'telefono' => '1141000011'],
            ['nombre' => 'Lucia Garrido',         'telefono' => '1141000012'],
            ['nombre' => 'Sebastián Herrera',     'telefono' => '1141000013'],
            ['nombre' => 'Martina Quiroga',       'telefono' => '1141000014'],
            ['nombre' => 'Alejandro Lucero',      'telefono' => '1141000015'],
            ['nombre' => 'Patricia Moreno',       'telefono' => '1141000016'],
            ['nombre' => 'Carlos Ramos',          'telefono' => '1141000017'],
            ['nombre' => 'Federico Villanueva',   'telefono' => '1141000018'],
            ['nombre' => 'Rodrigo Gutiérrez',     'telefono' => '1141000019'],
            ['nombre' => 'Coach Martínez',        'telefono' => '1141000020'],
            ['nombre' => 'Tamara Medina',         'telefono' => '1141000021'],
            ['nombre' => 'Enrique Peralta',       'telefono' => '1141000022'],
            ['nombre' => 'Natalia Castro',        'telefono' => '1141000023'],
            ['nombre' => 'Hugo Vidal',            'telefono' => '1141000024'],
            ['nombre' => 'Tomás Aguirre',         'telefono' => '1141000025'],
        ];

        foreach ($clientData as $cd) {
            $client = Client::firstOrCreate(
                ['business_account_id' => $businessAccountId, 'telefono' => $cd['telefono']],
                ['nombre' => $cd['nombre']]
            );
            $clients[$cd['telefono']] = $client->id;
        }

        $cid = fn(string $phone) => $clients[$phone];

        Reservation::insertOrIgnore([
            // ── Today ──────────────────────────────────────────────────
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8742','court_id'=>$c[2],'date'=>$today,    'start_hour'=>18.5,'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000001'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8741','court_id'=>$c[6],'date'=>$today,    'start_hour'=>17,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000002'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8740','court_id'=>$c[0],'date'=>$today,    'start_hour'=>20,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000003'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8739','court_id'=>$c[1],'date'=>$today,    'start_hour'=>19.5,'duration'=>1.5,'type'=>'open',   'client_id'=>$cid('1141000004'),'players'=>3,'total'=>16800,'status'=>'pending', 'is_open'=>true, 'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8738','court_id'=>$c[4],'date'=>$today,    'start_hour'=>21,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000005'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8737','court_id'=>$c[3],'date'=>$today,    'start_hour'=>16.5,'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000006'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8736','court_id'=>$c[5],'date'=>$today,    'start_hour'=>17.5,'duration'=>1.5,'type'=>'open',   'client_id'=>$cid('1141000007'),'players'=>2,'total'=>16800,'status'=>'partial', 'is_open'=>true, 'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8735','court_id'=>$c[7],'date'=>$today,    'start_hour'=>15.5,'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000008'),'players'=>4,'total'=>16800,'status'=>'pending', 'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            // ── Yesterday ──────────────────────────────────────────────
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8734','court_id'=>$c[0],'date'=>$yesterday,'start_hour'=>18,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000009'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8733','court_id'=>$c[1],'date'=>$yesterday,'start_hour'=>19.5,'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000010'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8732','court_id'=>$c[2],'date'=>$yesterday,'start_hour'=>10,  'duration'=>2,  'type'=>'lesson', 'client_id'=>$cid('1141000011'),'players'=>4,'total'=>22400,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8731','court_id'=>$c[3],'date'=>$yesterday,'start_hour'=>17,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000012'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8730','court_id'=>$c[4],'date'=>$yesterday,'start_hour'=>16,  'duration'=>1.5,'type'=>'open',   'client_id'=>$cid('1141000013'),'players'=>3,'total'=>16800,'status'=>'partial', 'is_open'=>true, 'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8729','court_id'=>$c[5],'date'=>$yesterday,'start_hour'=>20,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000014'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8728','court_id'=>$c[6],'date'=>$yesterday,'start_hour'=>15.5,'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000015'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8727','court_id'=>$c[7],'date'=>$yesterday,'start_hour'=>21,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000016'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8726','court_id'=>$c[2],'date'=>$yesterday,'start_hour'=>13,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000017'),'players'=>4,'total'=>16800,'status'=>'refunded','is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            // ── May 23 ────────────────────────────────────────────────
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8725','court_id'=>$c[0],'date'=>$day22,   'start_hour'=>17,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000018'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8724','court_id'=>$c[1],'date'=>$day22,   'start_hour'=>19,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000019'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8723','court_id'=>$c[3],'date'=>$day22,   'start_hour'=>16,  'duration'=>2,  'type'=>'lesson', 'client_id'=>$cid('1141000020'),'players'=>4,'total'=>22400,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8722','court_id'=>$c[4],'date'=>$day22,   'start_hour'=>20.5,'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000021'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8721','court_id'=>$c[6],'date'=>$day22,   'start_hour'=>18,  'duration'=>1.5,'type'=>'open',   'client_id'=>$cid('1141000022'),'players'=>3,'total'=>16800,'status'=>'refunded','is_open'=>true, 'created_at'=>now(),'updated_at'=>now()],
            // ── May 22 ────────────────────────────────────────────────
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8720','court_id'=>$c[2],'date'=>$day21,   'start_hour'=>16,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000023'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8719','court_id'=>$c[5],'date'=>$day21,   'start_hour'=>18.5,'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000024'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
            ['business_account_id'=>$businessAccountId,'booking_ref'=>'PD-8718','court_id'=>$c[7],'date'=>$day21,   'start_hour'=>20,  'duration'=>1.5,'type'=>'private','client_id'=>$cid('1141000025'),'players'=>4,'total'=>16800,'status'=>'paid',    'is_open'=>false,'created_at'=>now(),'updated_at'=>now()],
        ]);
    }
}
