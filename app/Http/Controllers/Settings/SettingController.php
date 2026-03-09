<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Models\Channel;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('settings/index', [
            'accommodations' => Accommodation::all(),
            'channels' => Channel::all(),
        ]);
    }
}
