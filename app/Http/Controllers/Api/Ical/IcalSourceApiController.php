<?php

namespace App\Http\Controllers\Api\Ical;

use App\Http\Controllers\Controller;
use App\Http\Resources\IcalSourceResource;
use App\Models\Channel;
use App\Models\IcalSource;
use Illuminate\Http\JsonResponse;

class IcalSourceApiController extends Controller
{
    /**
     * Display a listing of the iCal sources.
     */
    public function index(Channel $channel): JsonResponse
    {
        $sources = IcalSource::with('unit')
            ->where('channel_id', $channel->id)
            ->get();

        return response()->json(IcalSourceResource::collection($sources));
    }
}
