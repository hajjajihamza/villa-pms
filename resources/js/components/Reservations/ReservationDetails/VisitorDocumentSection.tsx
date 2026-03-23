import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { DocumentForm } from '../ReservationForm/DocumentForm';

interface VisitorDocumentSectionProps {
    documents: any[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, key: string, value: any) => void;
    onFileChange: (index: number, e: ChangeEvent<HTMLInputElement>) => void;
    errors: Record<string, any>;
    baseId: string;
    isEditing?: boolean;
}

export function VisitorDocumentSection({
    documents,
    onAdd,
    onRemove,
    onUpdate,
    onFileChange,
    errors,
    baseId,
    isEditing = true
}: VisitorDocumentSectionProps) {
    return (
        <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                    Documents & Pièces d'identité
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAdd}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" /> Ajouter
                </Button>
            </div>

            {documents?.map((doc, idx) => (
                <DocumentForm
                    key={doc.id || doc.tempId || `${baseId}-doc-${idx}`}
                    doc={doc}
                    index={idx}
                    baseId={baseId}
                    isEditing={isEditing}
                    error={errors[`documents.${idx}.file`]}
                    onRemove={onRemove}
                    onUpdate={onUpdate}
                    onFileChange={onFileChange}
                />
            ))}

            {(!documents || documents.length === 0) && (
                <div className="rounded-xl border-2 border-dashed py-6 text-center text-muted-foreground">
                    <p className="text-sm">Aucun document attaché</p>
                </div>
            )}
        </div>
    );
}
