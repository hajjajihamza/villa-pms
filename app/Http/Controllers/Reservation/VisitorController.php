<?php

declare(strict_types=1);

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\DocumentRequest;
use App\Http\Requests\Reservation\VisitorRequest;
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

    /**
     * Store a newly created visitor in storage.
     */
    public function storeVisitor(VisitorRequest $request, Reservation $reservation): RedirectResponse
    {
        $this->visitorService->storeVisitor($request->validated(), $reservation);

        return redirect()->back()->with('success', 'Visiteur ajouté avec succès.');
    }

    /**
     * Update the specified visitor in storage.
     */
    public function updateVisitor(VisitorRequest $request, Visitor $visitor): RedirectResponse
    {
        $this->visitorService->updateVisitor($request->validated(), $visitor);

        return redirect()->back()->with('success', 'Visiteur mis à jour avec succès.');
    }

    /**
     * Remove the specified visitor from storage.
     */
    public function destroyVisitor(Visitor $visitor): RedirectResponse
    {
        if ($visitor->is_main) {
            return redirect()->back()->with('error', 'Le visiteur principal ne peut pas être supprimé.');
        }

        $this->visitorService->destroyVisitor($visitor);

        return redirect()->back()->with('success', 'Visiteur supprimé avec succès.');
    }

    /**
     * Store a newly created document in storage.
     */
    public function storeDocument(DocumentRequest $request, Visitor $visitor): RedirectResponse
    {
        $this->visitorService->storeDocument(
            $request->validated(),
            $visitor,
            $request->file('file')
        );

        return redirect()->back()->with('success', 'Document ajouté avec succès.');
    }

    /**
     * Update the specified document in storage.
     */
    public function updateDocument(DocumentRequest $request, Document $document): RedirectResponse
    {
        $this->visitorService->updateDocument(
            $request->validated(),
            $document,
            $request->file('file')
        );

        return redirect()->back()->with('success', 'Document mis à jour avec succès.');
    }

    /**
     * Remove the specified document from storage.
     */
    public function destroyDocument(Document $document): RedirectResponse
    {
        $this->visitorService->destroyDocument($document);

        return redirect()->back()->with('success', 'Document supprimé avec succès.');
    }
}
