<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\Accommodation;
use App\Models\Channel;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Reservation;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $channelsData = [
            ['name' => 'Booking', 'color' => '#003580', 'commission' => 17.0],
            ['name' => 'Airbnb', 'color' => '#FF5A5F', 'commission' => 10.0],
            ['name' => 'Direct', 'color' => '#4CAF50', 'commission' => 0.0],
        ];

        Channel::insert($channelsData);

        $usersData = [
            ['name' => 'Admin', 'email' => 'hajjajihamza05@gmail.com', 'username' => 'admin', 'role' => RoleEnum::ADMIN, 'password' => Hash::make('password')],
            ['name' => 'Staff', 'email' => 'hajjajihamza07@outlook.com', 'username' => 'staff', 'role' => RoleEnum::STAFF, 'password' => Hash::make('password')],
        ];

        User::insert($usersData);

        $unitsData = [
            ['name' => 'Villa'],
            ['name' => 'Suite'],
        ];

        Unit::insert($unitsData);

        $unitVilla = Unit::where('name', 'Villa')->first();
        $unitSuite = Unit::where('name', 'Suite')->first();

        $accommodationsData = [
            [
                'name' => 'Villa Principal',
                'daily_price' => 1000.0,
                'max_adults' => 6,
                'max_children' => 4,
                'service_price' => 150.0,
                'color' => '#1A237E',
                'units' => [$unitVilla->id],
            ],
            [
                'name' => 'Suite Principal',
                'daily_price' => 500.0,
                'max_adults' => 2,
                'max_children' => 1,
                'service_price' => 150.0,
                'color' => '#C2185B',
                'units' => [$unitSuite->id],
            ],
            [
                'name' => 'Villa + Suite Combo',
                'daily_price' => 1500.0,
                'max_adults' => 8,
                'max_children' => 6,
                'service_price' => 300.0,
                'color' => '#4CAF50',
                'units' => [$unitVilla->id, $unitSuite->id],
            ],
        ];

        foreach ($accommodationsData as $accommodationData) {
            $unitIds = $accommodationData['units'];
            unset($accommodationData['units']);

            $accommodation = Accommodation::create($accommodationData);
            $accommodation->units()->attach($unitIds);
        }

        $admin = User::where('username', 'admin')->first();
        $booking = Channel::where('name', 'Booking')->first();
        $airbnb = Channel::where('name', 'Airbnb')->first();
        $direct = Channel::where('name', 'Direct')->first();
        $villaPrincipal = Accommodation::where('name', 'Villa Principal')->first();
        $suitePrincipal = Accommodation::where('name', 'Suite Principal')->first();
        $comboAccommodation = Accommodation::where('name', 'Villa + Suite Combo')->first();

        $reservationsData = [
            [
                'reservation' => [
                    'check_in' => Carbon::today()->addDays(2)->toDateString(),
                    'check_out' => Carbon::today()->addDays(6)->toDateString(),
                    'adults' => 2,
                    'children' => 1,
                    'reported' => false,
                    'advance_amount' => 800.00,
                    'daily_price' => 1000.00,
                    'service_price' => 150.00,
                    'created_by' => $admin->id,
                    'channel_id' => $booking->id,
                    'accommodation_id' => $villaPrincipal->id,
                ],
                'visitors' => [
                    ['full_name' => 'John Carter', 'phone' => '+1 202 555 0101', 'country' => 'USA', 'is_main' => true],
                    ['full_name' => 'Emily Carter', 'phone' => '+1 202 555 0102', 'country' => 'USA', 'is_main' => false],
                    ['full_name' => 'Noah Carter', 'phone' => null, 'country' => 'USA', 'is_main' => false],
                ],
            ],
            [
                'reservation' => [
                    'check_in' => Carbon::today()->subDays(8)->toDateString(),
                    'check_out' => Carbon::today()->subDays(4)->toDateString(),
                    'real_check_in' => Carbon::today()->subDays(8)->setTime(15, 0, 0),
                    'real_check_out' => Carbon::today()->subDays(4)->setTime(11, 0, 0),
                    'adults' => 2,
                    'children' => 0,
                    'reported' => true,
                    'advance_amount' => 300.00,
                    'daily_price' => 500.00,
                    'service_price' => 150.00,
                    'created_by' => $admin->id,
                    'channel_id' => $airbnb->id,
                    'accommodation_id' => $suitePrincipal->id,
                ],
                'visitors' => [
                    ['full_name' => 'Sofia Martin', 'phone' => '+33 6 12 34 56 78', 'country' => 'France', 'is_main' => true],
                    ['full_name' => 'Leo Martin', 'phone' => '+33 6 98 76 54 32', 'country' => 'France', 'is_main' => false],
                ],
            ],
            [
                'reservation' => [
                    'check_in' => Carbon::today()->toDateString(),
                    'check_out' => Carbon::today()->addDays(3)->toDateString(),
                    'real_check_in' => Carbon::today()->setTime(14, 30, 0),
                    'real_check_out' => Carbon::today()->addDays(3)->setTime(12, 0, 0),
                    'adults' => 4,
                    'children' => 2,
                    'reported' => false,
                    'advance_amount' => 1500.00,
                    'daily_price' => 1500.00,
                    'service_price' => 300.00,
                    'created_by' => $admin->id,
                    'channel_id' => $direct->id,
                    'accommodation_id' => $comboAccommodation->id,
                ],
                'visitors' => [
                    ['full_name' => 'Omar Bennani', 'phone' => '+212 6 61 23 45 67', 'country' => 'Morocco', 'is_main' => true],
                    ['full_name' => 'Sara Bennani', 'phone' => '+212 6 61 23 45 68', 'country' => 'Morocco', 'is_main' => false],
                    ['full_name' => 'Yasmine Bennani', 'phone' => null, 'country' => 'Morocco', 'is_main' => false],
                    ['full_name' => 'Adam Bennani', 'phone' => null, 'country' => 'Morocco', 'is_main' => false],
                ],
            ],
            [
                'reservation' => [
                    'check_in' => Carbon::today()->addDays(10)->toDateString(),
                    'check_out' => Carbon::today()->addDays(12)->toDateString(),
                    'adults' => 1,
                    'children' => 0,
                    'reported' => false,
                    'advance_amount' => 200.00,
                    'daily_price' => 500.00,
                    'service_price' => 150.00,
                    'created_by' => $admin->id,
                    'channel_id' => $booking->id,
                    'accommodation_id' => $suitePrincipal->id,
                ],
                'visitors' => [
                    ['full_name' => 'Hana El Idrissi', 'phone' => '+212 6 70 11 22 33', 'country' => 'Morocco', 'is_main' => true],
                ],
            ],
        ];

        foreach ($reservationsData as $reservationData) {
            $reservation = Reservation::create($reservationData['reservation']);
            $reservation->visitors()->createMany($reservationData['visitors']);
        }

        $categoriesData = [
            ['name' => 'Food'],
            ['name' => 'Service'],
            ['name' => 'Transport'],
            ['name' => 'Other'],
        ];

        ProductCategory::insert($categoriesData);

        $catFood = ProductCategory::where('name', 'Food')->first()->id;
        $catService = ProductCategory::where('name', 'Service')->first()->id;
        $catTransport = ProductCategory::where('name', 'Transport')->first()->id;
        $catOther = ProductCategory::where('name', 'Other')->first()->id;

        $productsData = [
            ['name' => 'Petit Déjeuner Complet', 'price' => 12.0, 'category_id' => $catFood, 'icon' => '🍳'],
            ['name' => 'Déjeuner Traditionnel', 'price' => 25.0, 'category_id' => $catFood, 'icon' => '🍲'],
            ['name' => 'Dîner Gastronomique', 'price' => 45.0, 'category_id' => $catFood, 'icon' => '🍷'],
            ['name' => 'Panier Gouter', 'price' => 8.0, 'category_id' => $catFood, 'icon' => '🧺'],
            ['name' => 'Ménage Complet', 'price' => 30.0, 'category_id' => $catService, 'icon' => '🧹'],
            ['name' => 'Blanchisserie', 'price' => 15.0, 'category_id' => $catService, 'icon' => '🧺'],
            ['name' => 'Massage Relaxant (1h)', 'price' => 60.0, 'category_id' => $catService, 'icon' => '💆'],
            ['name' => 'Transfert Aéroport (Aller)', 'price' => 40.0, 'category_id' => $catTransport, 'icon' => '🚕'],
            ['name' => 'Location Voiture (Jour)', 'price' => 50.0, 'category_id' => $catTransport, 'icon' => '🚗'],
            ['name' => 'Navette Centre Ville', 'price' => 20.0, 'category_id' => $catTransport, 'icon' => '🚐'],
            ['name' => 'Location Vélo (Jour)', 'price' => 10.0, 'category_id' => $catOther, 'icon' => '🚲'],
            ['name' => 'Bouteille de Vin Local', 'price' => 25.0, 'category_id' => $catOther, 'icon' => '🍾'],
        ];

        Product::insert($productsData);
    }
}
