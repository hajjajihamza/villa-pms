<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Enums\RoleEnum;
use App\Models\Accommodation;
use App\Models\Channel;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ────────────────────────────────────────────────
        //  Channels
        // ────────────────────────────────────────────────
        $channelsData = [
            ['name' => 'Booking', 'color' => '#003580', 'commission' => 17.0],
            ['name' => 'Airbnb', 'color' => '#FF5A5F', 'commission' => 10.0],
            ['name' => 'Direct', 'color' => '#4CAF50', 'commission' => 0.0],
        ];

        Channel::insert($channelsData);

        // ────────────────────────────────────────────────
        //  Users
        // ────────────────────────────────────────────────
        $usersData = [
            ['name' => 'Admin', 'email' => 'hajjajihamza05@gmail.com', 'username' => 'admin', 'role' => RoleEnum::ADMIN, 'password' => Hash::make('password')],
            ['name' => 'Staff', 'email' => 'hajjajihamza07@outlook.com', 'username' => 'staff', 'role' => RoleEnum::STAFF, 'password' => Hash::make('password')],
        ];

        User::insert($usersData);

        // ────────────────────────────────────────────────
        //  Units
        // ────────────────────────────────────────────────
        $unitsData = [
            ['name' => 'Villa'],
            ['name' => 'Suite'],
        ];

        Unit::insert($unitsData);

        $unitVilla = Unit::where('name', 'Villa')->first();
        $unitSuite = Unit::where('name', 'Suite')->first();

        // ────────────────────────────────────────────────
        //  Accommodations
        // ────────────────────────────────────────────────
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

        // ────────────────────────────────────────────────
        //  Products && Categories
        // ────────────────────────────────────────────────
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
