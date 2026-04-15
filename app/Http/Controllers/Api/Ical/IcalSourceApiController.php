<?php

namespace App\Http\Controllers\Api\Ical;

use App\Http\Controllers\Controller;
use App\Http\Resources\IcalSourceResource;
use App\Models\Accommodation;
use App\Models\IcalSource;
use Illuminate\Http\JsonResponse;

class IcalSourceApiController extends Controller
{
    /**
     * Display a listing of the iCal sources.
     */
    public function index(Accommodation $accommodation): JsonResponse
    {
        $sources = IcalSource::with('channel')
            ->where('accommodation_id', $accommodation->id)
            ->get();

        return response()->json(IcalSourceResource::collection($sources));
    }
}
