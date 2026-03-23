<?php

declare(strict_types=1);

namespace App\Services\Reservation;

use App\Models\Document;
use App\Models\Reservation;
use App\Models\Visitor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class VisitorService
{
    /**
     * Store a newly created visitor in storage.
     */
    public function storeVisitor(array $data, Reservation $reservation): Visitor
    {
        return $reservation->visitors()->create($data);
    }

    /**
     * Update the specified visitor in storage.
     */
    public function updateVisitor(array $data, Visitor $visitor): bool
    {
        return $visitor->update($data);
    }

    /**
     * Remove the specified visitor from storage.
     */
    public function destroyVisitor(Visitor $visitor): bool
    {
        if ($visitor->is_main) {
            return false;
        }

        return DB::transaction(function () use ($visitor) {
            // Delete associated documents and their files
            foreach ($visitor->documents as $document) {
                $this->destroyDocument($document);
            }

            return $visitor->delete();
        });
    }

    /**
     * Store a newly created document in storage.
     */
    public function storeDocument(array $data, Visitor $visitor, $file): Document
    {
        $path = $file->store('visitor-documents', 'public');

        return $visitor->documents()->create([
            'type' => $data['type'] ?? null,
            'file_path' => $path,
        ]);
    }

    /**
     * Update the specified document in storage.
     */
    public function updateDocument(array $data, Document $document, $file = null): bool
    {
        $updateData = ['type' => $data['type'] ?? $document->type];

        if ($file) {
            // Delete old file
            if ($document->file_path) {
                Storage::disk('public')->delete($document->file_path);
            }
            $updateData['file_path'] = $file->store('visitor-documents', 'public');
        }

        return $document->update($updateData);
    }

    /**
     * Remove the specified document from storage.
     */
    public function destroyDocument(Document $document): bool
    {
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        return (bool) $document->delete();
    }
}
