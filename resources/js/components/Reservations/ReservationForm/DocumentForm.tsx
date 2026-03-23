import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, FileText, Trash2, Upload, File as FileIcon } from 'lucide-react';
import type { ChangeEvent } from 'react';
import InputError from '@/components/input-error';

const DOC_TYPES: Record<string, string> = {
    ID_CARD: "Carte d'identité (CIN)",
    PASSPORT: "Passeport",
    DRIVERS_LICENSE: "Permis de conduire",
    RESIDENCE_CARD: "Carte de séjour",
};

interface DocumentFormProps {
    doc: {
        id?: number;
        type: string;
        file?: File | null;
        url?: string;
    };
    index: number;
    baseId: string;
    isEditing: boolean;
    error?: string;
    onRemove: (index: number) => void;
    onUpdate: (index: number, key: string, value: any) => void;
    onFileChange: (index: number, e: ChangeEvent<HTMLInputElement>) => void;
}

export function DocumentForm({
    doc,
    index,
    baseId,
    isEditing,
    error,
    onRemove,
    onUpdate,
    onFileChange
}: DocumentFormProps) {
    const showDisplayOnly = doc.id && !doc.file && !isEditing;

    return (
        <div className="relative space-y-4 rounded-xl border bg-muted/20 p-4">
            <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-3 right-0 h-8 w-8 rounded-full shadow-sm"
                onClick={() => onRemove(index)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            {showDisplayOnly ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileIcon className="h-6 w-6 text-brand-500" />
                        <div>
                            <p className="text-sm font-bold">
                                {DOC_TYPES[doc.type] || doc.type}
                            </p>
                            <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 text-xs hover:underline"
                            >
                                Voir le document
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Type de Document</Label>
                            <span className="sr-only">Sélectionner le type de document</span>
                            <Select
                                value={doc.type}
                                onValueChange={(val) => onUpdate(index, 'type', val)}
                            >
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Sélectionner le type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ID_CARD">Carte d'identité (CIN)</SelectItem>
                                    <SelectItem value="PASSPORT">Passeport</SelectItem>
                                    <SelectItem value="DRIVERS_LICENSE">Permis de conduire</SelectItem>
                                    <SelectItem value="RESIDENCE_CARD">Carte de séjour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Fichier / Photo</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    id={`${baseId}-file-${index}`}
                                    onChange={(e) => onFileChange(index, e)}
                                />
                                <Input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    id={`${baseId}-camera-${index}`}
                                    onChange={(e) => onFileChange(index, e)}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 flex-1"
                                    asChild
                                >
                                    <label
                                        htmlFor={`${baseId}-file-${index}`}
                                        className="cursor-pointer gap-2"
                                    >
                                        <Upload className="h-4 w-4" /> Parcourir
                                    </label>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 flex-1"
                                    asChild
                                >
                                    <label
                                        htmlFor={`${baseId}-camera-${index}`}
                                        className="cursor-pointer gap-2"
                                    >
                                        <Camera className="h-4 w-4" /> Caméra
                                    </label>
                                </Button>
                            </div>
                            {error && <InputError message={error} />}
                        </div>
                    </div>

                    {doc.url && (
                        <div className="mt-4 flex justify-center overflow-hidden rounded-lg border bg-background">
                            {doc.url.endsWith('.pdf') || (doc.file && doc.file.type === 'application/pdf') ? (
                                <div className="flex w-full flex-col items-center justify-center p-8 text-muted-foreground">
                                    <FileIcon className="mb-2 h-12 w-12" />
                                    <span className="text-sm font-medium">Document PDF</span>
                                    {doc.id && (
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-2 text-xs font-semibold text-primary hover:underline"
                                        >
                                            Ouvrir le document
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="relative flex h-auto max-h-[160px] w-full items-center justify-center p-2">
                                    <img
                                        src={doc.url}
                                        alt={`Document ${index + 1}`}
                                        className="max-h-[160px] w-auto rounded object-contain mix-blend-multiply dark:mix-blend-normal"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
