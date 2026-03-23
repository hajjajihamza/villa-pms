<?php

declare(strict_types=1);

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\DocumentRequest;
use App\Http\Requests\Reservation\VisitorRequest;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\VisitorResource;
use App\Models\Document;
use App\Models\Reservation;
use App\Models\Visitor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class VisitorController extends Controller
{
    /**
     * Store a newly created visitor in storage.
     */
    public function storeVisitor(VisitorRequest $request, Reservation $reservation): RedirectResponse
    {
        $reservation->visitors()->create($request->validated());

        return redirect()->back()->with('success', 'Visiteur ajouté avec succès.');
    }

    /**
     * Update the specified visitor in storage.
     */
    public function updateVisitor(VisitorRequest $request, Visitor $visitor): RedirectResponse
    {
        $visitor->update($request->validated());

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

        // Delete associated documents and their files
        foreach ($visitor->documents as $document) {
            if ($document->file_path) {
                Storage::disk('public')->delete($document->file_path);
            }
            $document->delete();
        }

        $visitor->delete();

        return redirect()->back()->with('success', 'Visiteur supprimé avec succès.');
    }

    /**
     * Store a newly created document in storage.
     */
    public function storeDocument(DocumentRequest $request, Visitor $visitor): RedirectResponse
    {
        $path = $request->file('file')->store('visitor-documents', 'public');

        $visitor->documents()->create([
            'type' => $request->type,
            'file_path' => $path,
        ]);

        return redirect()->back()->with('success', 'Document ajouté avec succès.');
    }

    /**
     * Update the specified document in storage.
     */
    public function updateDocument(DocumentRequest $request, Document $document): RedirectResponse
    {
        $data = ['type' => $request->type];

        if ($request->hasFile('file')) {
            // Delete old file
            if ($document->file_path) {
                Storage::disk('public')->delete($document->file_path);
            }
            $data['file_path'] = $request->file('file')->store('visitor-documents', 'public');
        }

        $document->update($data);

        return redirect()->back()->with('success', 'Document mis à jour avec succès.');
    }

    /**
     * Remove the specified document from storage.
     */
    public function destroyDocument(Document $document): RedirectResponse
    {
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return redirect()->back()->with('success', 'Document supprimé avec succès.');
    }
}
