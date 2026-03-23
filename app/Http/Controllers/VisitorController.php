<?php

namespace App\Http\Controllers;

use App\Http\Requests\Reservation\StoreVisitorRequest;
use App\Models\Document;
use App\Models\Reservation;
use App\Models\Visitor;
use App\Services\Reservation\VisitorService;
use Illuminate\Http\RedirectResponse;

class VisitorController extends Controller
{
    public function __construct(
        protected VisitorService $visitorService
    ) {}

    public function storeVisitor(StoreVisitorRequest $request, Reservation $reservation): RedirectResponse
    {
        $this->visitorService->addVisitor($reservation, $request->validated());

        return redirect()->back()->with('success', 'Visiteur ajouté avec succès.');
    }

    public function updateVisitor(StoreVisitorRequest $request, Visitor $visitor): RedirectResponse
    {
        $this->visitorService->updateVisitor($visitor, $request->validated());

        return redirect()->back()->with('success', 'Visiteur mis à jour avec succès.');
    }

    public function destroyDocument(Document $document): RedirectResponse
    {
        $this->visitorService->deleteDocument($document);

        return redirect()->back()->with('success', 'Document supprimé.');
    }

    public function destroyVisitor(Visitor $visitor): RedirectResponse
    {
        try {
            $this->visitorService->deleteVisitor($visitor);
            return redirect()->back()->with('success', 'Visiteur supprimé avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
