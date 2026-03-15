<?php

declare(strict_types=1);

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\StoreReservationRequest;
use App\Models\Accommodation;
use App\Models\Channel;
use App\Models\Reservation;
use App\Models\Unit;
use App\Models\Document;
use App\Models\Visitor;
use App\Http\Requests\StoreVisitorRequest;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->renderReservations(Reservation::arrivals(), activeTab: 'arrivals', request: $request);
    }

    public function departures(Request $request): Response
    {
        return $this->renderReservations(Reservation::departures(), 'departures', $request);
    }

    public function archive(Request $request): Response
    {
        return $this->renderReservations(Reservation::archive(), 'archive', $request);
    }

    public function stayOvers(Request $request): Response
    {
        return $this->renderReservations(Reservation::stayOvers(), 'stay-overs', $request);
    }

    public function all(Request $request): Response
    {
        return $this->renderReservations(Reservation::query(), 'all', $request);
    }

    protected function renderReservations(Builder $query, string $activeTab, Request $request): Response
    {
        $reservations = $query
            ->with(['accommodation.units', 'channel', 'creator', 'visitors.documents', 'orders.orderItems'])
            ->when($request->accommodation_id, function ($query, $accommodationId) {
                $query->where('accommodation_id', $accommodationId);
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('visitors', function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query->where('full_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
                });
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                $query->whereDate('check_in', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                $query->whereDate('check_out', '<=', $dateTo);
            })
            ->orderBy('check_in')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('reservations/index', [
            'reservations' => $reservations,
            'channels' => Channel::all(),
            'accommodations' => Accommodation::with('units:id')->get(),
            'activeTab' => $activeTab,
            'units' => Unit::all(),
        ]);
    }

    public function store(StoreReservationRequest $request): RedirectResponse
    {
        $validatedData = $request->validated();

        $accommodation = Accommodation::query()->findOrFail($validatedData['accommodation_id']);

        $duration = (int) Carbon::parse($validatedData['check_in'])->diffInDays(Carbon::parse($validatedData['check_out']));
        $dailyPrice = (float) $validatedData['total'] / $duration;
        $reservationData = [
            'check_in' => $validatedData['check_in'],
            'check_out' => $validatedData['check_out'],
            'adults' => $validatedData['adults'],
            'children' => $validatedData['children'],
            'advance_amount' => $validatedData['advance_amount'],
            'daily_price' => $dailyPrice,
            'service_price' => $accommodation->service_price,
            'channel_id' => $validatedData['channel_id'],
            'accommodation_id' => $accommodation->id,
            'created_by' => auth()->id(),
        ];

        $reservation = Reservation::create($reservationData);
        $mainVisitor = $reservation->visitors()->create([
            'full_name' => $validatedData['full_name'],
            'phone' => $validatedData['phone'],
            'country' => $validatedData['country'],
            'is_main' => true,
        ]);

        if (isset($validatedData['documents']) && is_array($validatedData['documents'])) {
            foreach ($validatedData['documents'] as $docData) {
                if (isset($docData['file']) && $docData['file'] instanceof \Illuminate\Http\UploadedFile) {
                    $path = $docData['file']->store('visitor-documents', 'public');
                    $mainVisitor->documents()->create([
                        'type' => $docData['type'],
                        'file_path' => $path,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Réservation créée avec succès.');
    }

    public function update(StoreReservationRequest $request, Reservation $reservation): RedirectResponse
    {
        $validatedData = $request->validated();

        $accommodation = Accommodation::query()->findOrFail($validatedData['accommodation_id']);

        $duration = (int) Carbon::parse($validatedData['check_in'])->diffInDays(Carbon::parse($validatedData['check_out']));
        $dailyPrice = (float) $validatedData['total'] / $duration;
        $reservationData = [
            'check_in' => $validatedData['check_in'],
            'check_out' => $validatedData['check_out'],
            'adults' => $validatedData['adults'],
            'children' => $validatedData['children'],
            'advance_amount' => $validatedData['advance_amount'],
            'daily_price' =>  $dailyPrice,
            'service_price' => $accommodation->service_price,
            'channel_id' => $validatedData['channel_id'],
            'accommodation_id' => $accommodation->id,
            'created_by' => auth()->id(),
        ];

        $reservation->update($reservationData);

        $mainVisitor = $reservation->visitors->firstWhere('is_main', true);
        if ($mainVisitor) {
            $mainVisitor->update([
                'full_name' => $validatedData['full_name'],
                'phone' => $validatedData['phone'],
                'country' => $validatedData['country'],
            ]);

            if (isset($validatedData['documents']) && is_array($validatedData['documents'])) {
                foreach ($validatedData['documents'] as $docData) {
                    if (isset($docData['file']) && $docData['file'] instanceof \Illuminate\Http\UploadedFile) {
                        $path = $docData['file']->store('visitor-documents', 'public');
                        if (isset($docData['id'])) {
                            $existingDoc = $mainVisitor->documents()->find($docData['id']);
                            if ($existingDoc) {
                                if (Storage::disk('public')->exists($existingDoc->file_path)) {
                                    Storage::disk('public')->delete($existingDoc->file_path);
                                }
                                $existingDoc->update([
                                    'type' => $docData['type'],
                                    'file_path' => $path,
                                ]);
                                continue;
                            }
                        }
                        
                        $mainVisitor->documents()->create([
                            'type' => $docData['type'],
                            'file_path' => $path,
                        ]);
                    } elseif (isset($docData['id'])) {
                         $existingDoc = $mainVisitor->documents()->find($docData['id']);
                         if ($existingDoc && $existingDoc->type !== $docData['type']) {
                             $existingDoc->update(['type' => $docData['type']]);
                         }
                    }
                }
            }
        }

        return redirect()->back()->with('success', 'Réservation mise à jour avec succès.');
    }

    public function destroy(Reservation $reservation, Request $request): RedirectResponse
    {
        if ($request->deleted_note) {
            $reservation->update([
                'deleted_note' => $request->deleted_note,
            ]);
        }

        $reservation->delete();

        return redirect()->back()->with('success', 'Réservation supprimée avec succès.');
    }

    public function toggleReported(Reservation $reservation): RedirectResponse
    {
        $reservation->update([
            'reported' => ! $reservation->reported,
        ]);

        return redirect()->back()->with('success', 'Statut de la réservation mis à jour.');
    }

    public function storeVisitor(StoreVisitorRequest $request, Reservation $reservation): RedirectResponse
    {
        $validatedData = $request->validated();
        
        $visitor = $reservation->visitors()->create([
            'full_name' => $validatedData['full_name'],
            'phone' => $validatedData['phone'] ?? null,
            'country' => $validatedData['country'] ?? null,
            'document_number' => $validatedData['document_number'] ?? null,
            'is_main' => false,
        ]);

        if (isset($validatedData['documents']) && is_array($validatedData['documents'])) {
            foreach ($validatedData['documents'] as $docData) {
                if (isset($docData['file']) && $docData['file'] instanceof \Illuminate\Http\UploadedFile) {
                    $path = $docData['file']->store('visitor-documents', 'public');
                    $visitor->documents()->create([
                        'type' => $docData['type'],
                        'file_path' => $path,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Visiteur ajouté avec succès.');
    }

    public function updateVisitor(StoreVisitorRequest $request, Visitor $visitor): RedirectResponse
    {
        $validatedData = $request->validated();

        $visitor->update([
            'full_name' => $validatedData['full_name'],
            'phone' => $validatedData['phone'] ?? null,
            'country' => $validatedData['country'] ?? null,
            'document_number' => $validatedData['document_number'] ?? null,
        ]);

        if (isset($validatedData['documents']) && is_array($validatedData['documents'])) {
            foreach ($validatedData['documents'] as $docData) {
                if (isset($docData['file']) && $docData['file'] instanceof \Illuminate\Http\UploadedFile) {
                    $path = $docData['file']->store('visitor-documents', 'public');
                    if (isset($docData['id'])) {
                        $existingDoc = $visitor->documents()->find($docData['id']);
                        if ($existingDoc) {
                            if (Storage::disk('public')->exists($existingDoc->file_path)) {
                                Storage::disk('public')->delete($existingDoc->file_path);
                            }
                            $existingDoc->update([
                                'type' => $docData['type'],
                                'file_path' => $path,
                            ]);
                            continue;
                        }
                    }
                    
                    $visitor->documents()->create([
                        'type' => $docData['type'],
                        'file_path' => $path,
                    ]);
                } elseif (isset($docData['id'])) {
                     $existingDoc = $visitor->documents()->find($docData['id']);
                     if ($existingDoc && $existingDoc->type !== $docData['type']) {
                         $existingDoc->update(['type' => $docData['type']]);
                     }
                }
            }
        }

        return redirect()->back()->with('success', 'Visiteur mis à jour avec succès.');
    }

    public function validateStay(Reservation $reservation): RedirectResponse
    {
        $today = Carbon::today();

        abort_unless(
            $today->betweenIncluded(
                Carbon::parse($reservation->check_in),
                Carbon::parse($reservation->check_out),
            ),
            422,
            'Reservation cannot be validated outside the stay period.',
        );

        $reservation->update([
            'real_check_in' => $today,
            'real_check_out' => $reservation->check_out,
        ]);

        return redirect()->back()->with('success', 'Séjour validé avec succès.');
    }

    public function destroyDocument(Document $document): RedirectResponse
    {
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        $document->delete();

        return redirect()->back()->with('success', 'Document supprimé.');
    }
}
