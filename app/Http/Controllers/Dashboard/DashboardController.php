<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Reservation\PlanningService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private PlanningService $planningService)
    {
    }

    public function index(Request $request): Response
    {
        $view = $request->input('view', 'week');

        $startDate = $request->input('date') ? Carbon::parse($request->input('date')) : Carbon::today();
        $endDate = $startDate->copy()->addDays($view === 'month' ? 30 : 7);

        return Inertia::render('dashboard', [
            'date' => $startDate->toDateString(),
            'view' => $view,
            'data' => $this->planningService->getPlanningData($startDate, $endDate),
        ]);
    }
}
