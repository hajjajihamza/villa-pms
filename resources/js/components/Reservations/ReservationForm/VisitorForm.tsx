import { useForm } from '@inertiajs/react';
import type { FormEvent, ChangeEvent } from 'react';
import { PhoneInput } from 'react-international-phone';
import VisitorController from '@/actions/App/Http/Controllers/VisitorController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { CountryDropdown } from '@/components/ui/country-dropdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import 'react-international-phone/style.css';
import { VisitorDocumentSection } from '../ReservationDetails/VisitorDocumentSection';
import type { Visitor } from '@/types/models';

type VisitorFormData = {
    full_name: string;
    phone: string;
    country: string;
    documents: { file?: File | null, type: string, id?: number, url?: string, tempId?: string }[];
};

interface Props {
    reservationId: number;
    visitor?: Visitor;
    onSuccess?: () => void;
    onCancel: () => void;
    className?: string;
    showTitle?: boolean;
    initialAddDocument?: boolean;
}

export function VisitorForm({ 
    reservationId, 
    visitor, 
    onSuccess, 
    onCancel, 
    className, 
    showTitle = true,
    initialAddDocument = false
}: Props) {
    const isEdit = !!visitor;

    const initialData: VisitorFormData = {
        full_name: visitor?.full_name || '',
        phone: visitor?.phone || '',
        country: visitor?.country || 'ma',
        documents: [
            ...(visitor?.documents?.map(doc => ({
                id: doc.id,
                type: doc.type,
                url: `/storage/${doc.file_path}`,
            })) || []),
            ...(initialAddDocument ? [{ type: 'ID_CARD', url: undefined, file: null, tempId: 'initial-add' }] : [])
        ],
    };

    const form = useForm<VisitorFormData>(initialData);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEdit) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(VisitorController.updateVisitor(visitor.id).url, {
                preserveScroll: true,
                onSuccess: () => {
                    onSuccess?.();
                },
            });
        } else {
            form.post(VisitorController.storeVisitor(reservationId).url, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    form.clearErrors();
                    onSuccess?.();
                },
            });
        }
    };

    const addDocument = () => {
        form.setData('documents', [
            { type: 'ID_CARD', url: undefined, file: null, tempId: `new-${Date.now()}` },
            ...(form.data.documents || [])
        ]);
    };

    const removeDocument = (idx: number) => {
        const docs = [...form.data.documents];
        const doc = docs[idx];
        if (doc.id) {
             if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
                form.delete(VisitorController.destroyDocument(doc.id).url, {
                    preserveScroll: true,
                    onSuccess: () => {
                        docs.splice(idx, 1);
                        form.setData('documents', docs);
                    }
                });
             }
        } else {
            if (doc.url) URL.revokeObjectURL(doc.url!);
            docs.splice(idx, 1);
            form.setData('documents', docs);
        }
    };

    const updateDocument = (idx: number, key: string, value: any) => {
        const docs = [...form.data.documents];
        docs[idx] = { ...docs[idx], [key]: value };
        form.setData('documents', docs);
    };

    const handleFileChange = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Le fichier est trop volumineux (max 5MB)");
                return;
            }
            const url = URL.createObjectURL(file);
            const docs = [...form.data.documents];
            if (docs[idx].url && !docs[idx].id) URL.revokeObjectURL(docs[idx].url!);

            docs[idx] = { ...docs[idx], file, url };
            form.setData('documents', docs);
        }
    };

    return (
        <div className={cn("p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-brand-500/20 space-y-4", className)}>
            {showTitle && (
            <h4 className="text-sm font-black uppercase">
                {isEdit ? 'Modifier le Voyageur' : 'Nouveau Voyageur'}
            </h4>
            )}
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-2">
                        <Label>Nom complet</Label>
                        <Input
                            value={form.data.full_name}
                            onChange={(e) => form.setData('full_name', e.target.value)}
                            placeholder="Nom du visiteur"
                            required
                        />
                        <InputError message={form.errors.full_name} />
                    </div>
                    <div className="space-y-2">
                        <Label>Pays</Label>
                        <CountryDropdown
                            defaultValue={form.data.country}
                            onChange={val => form.setData('country', val)}
                        />
                        <InputError message={form.errors.country} />
                    </div>
                    <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <PhoneInput
                            defaultCountry="ma"
                            value={form.data.phone}
                            onChange={(val, {inputValue}) => inputValue.trim() !== val.trim() && form.setData('phone', val)}
                            inputClassName={cn(
                                "w-full",
                                form.errors.phone && "border-destructive"
                            )}
                            className="h-11"
                        />
                        <InputError message={form.errors.phone} />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <VisitorDocumentSection
                        documents={form.data.documents}
                        onAdd={addDocument}
                        onRemove={removeDocument}
                        onUpdate={updateDocument}
                        onFileChange={handleFileChange}
                        errors={form.errors}
                        baseId={isEdit ? `edit-visitor-${visitor.id}` : "add-visitor"}
                        isEditing={true}
                    />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
                    <Button type="submit" disabled={form.processing} className="bg-brand-500 text-white">
                        {isEdit ? 'Enregistrer' : 'Ajouter'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
