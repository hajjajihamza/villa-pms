<?php

declare(strict_types=1);

namespace App\Services\Reservation;

use App\Models\Document;
use App\Models\Reservation;
use App\Models\Visitor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class VisitorService
{
    /**
     * Add a visitor to a reservation.
     */
    public function addVisitor(Reservation $reservation, array $data): Visitor
    {
        return DB::transaction(function () use ($reservation, $data) {
            $visitor = $reservation->visitors()->create([
                'full_name' => $data['full_name'],
                'phone' => $data['phone'] ?? null,
                'country' => $data['country'] ?? null,
                'is_main' => false
            ]);

            if (isset($data['documents']) && is_array($data['documents'])) {
                foreach ($data['documents'] as $docData) {
                    if (isset($docData['file']) && $docData['file'] instanceof UploadedFile) {
                        $path = $docData['file']->store('visitor-documents', 'public');
                        $visitor->documents()->create([
                            'type' => $docData['type'],
                            'file_path' => $path,
                        ]);
                    }
                }
            }

            return $visitor;
        });
    }

    /**
     * Update an existing visitor.
     */
    public function updateVisitor(Visitor $visitor, array $data): Visitor
    {
        return DB::transaction(function () use ($visitor, $data) {
            $visitor->update([
                'full_name' => $data['full_name'],
                'phone' => $data['phone'] ?? null,
                'country' => $data['country'] ?? null,
            ]);

            if (isset($data['documents']) && is_array($data['documents'])) {
                foreach ($data['documents'] as $docData) {
                    if (isset($docData['file']) && $docData['file'] instanceof UploadedFile) {
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

            return $visitor;
        });
    }

    /**
     * Delete a document and its associated file.
     */
    public function deleteDocument(Document $document): void
    {
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        $document->delete();
    }

    /**
     * Delete a visitor and all associated documents.
     */
    public function deleteVisitor(Visitor $visitor): void
    {
        if ($visitor->is_main) {
            throw new \Exception("Le visiteur principal ne peut pas être supprimé.");
        }

        DB::transaction(function () use ($visitor) {
            foreach ($visitor->documents as $document) {
                $this->deleteDocument($document);
            }
            $visitor->delete();
        });
    }
}
