import { useState, useRef, ChangeEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Phone, Users, Plus, Trash2, Camera, Upload, File as FileIcon, ChevronDown, ChevronUp, Save, CheckCircle2 } from 'lucide-react';
import { CircleFlag } from 'react-circle-flags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { CountryDropdown } from '../ui/country-dropdown';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Visitor, DocType } from '@/types/models';
import { cn } from '@/lib/utils';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';

interface VisitorCardProps {
    visitor: Visitor;
    index: number;
}

type VisitorFormData = {
    full_name: string;
    phone: string;
    country: string;
    document_number: string;
    documents: { file?: File | null, type: string, id?: number, url?: string }[];
};

export function VisitorCard({ visitor, index }: VisitorCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialData: VisitorFormData = {
        full_name: visitor.full_name,
        phone: visitor.phone || '',
        country: visitor.country || 'ma',
        document_number: visitor.document_number || '',
        documents: visitor.documents?.map(doc => ({
            id: doc.id,
            type: doc.type,
            url: `/storage/${doc.file_path}`,
        })) || [],
    };

    const form = useForm<VisitorFormData>(initialData);

    const isMain = visitor.is_main;

    const addDocument = () => {
        form.setData('documents', [
            ...(form.data.documents || []),
            { type: 'ID_CARD', url: undefined, file: null }
        ]);
        setIsEditing(true);
    };

    const removeDocument = (idx: number) => {
        const docs = [...form.data.documents];
        const doc = docs[idx];
        if (doc.id) {
            confirm("Êtes-vous sûr de vouloir supprimer ce document ?") && form.delete(ReservationController.destroyDocument(doc.id).url, {
                preserveScroll: true,
                onSuccess: () => {
                    docs.splice(idx, 1);
                    form.setData('documents', docs);
                }
            });
        } else {
            if (doc.url) URL.revokeObjectURL(doc.url);
            docs.splice(idx, 1);
            form.setData('documents', docs);
        }
    };

    const updateDocument = (idx: number, key: string, value: any) => {
        const docs = [...form.data.documents];
        docs[idx][key as keyof typeof docs[0]] = value as never;
        form.setData('documents', docs);
        setIsEditing(true);
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
            const oldUrl = docs[idx].url;
            if (oldUrl && !docs[idx].id) URL.revokeObjectURL(oldUrl);

            docs[idx].file = file;
            docs[idx].url = url;
            form.setData('documents', docs);
            setIsEditing(true);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post(`/reservations/visitors/${visitor.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    };

    return (
        <form onSubmit={submit} className={`p-6 sm:p-8 rounded-2xl border-2 transition-all space-y-6 ${isMain
            ? 'bg-brand-50/20 border-brand-500/20 dark:bg-brand-900/10 dark:border-brand-500/30'
            : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800'
            }`}>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex items-center gap-4 w-full">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-black shrink-0 ${isMain
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                        }`}>
                        {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                        {!isEditing ? (
                            <>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-lg sm:text-xl font-black dark:text-white tracking-tight truncate">
                                        {visitor.full_name}
                                    </h4>
                                    {isMain && (
                                        <span className="bg-brand-500 text-white px-2 py-0.5 rounded-full text-[0.5rem] font-black uppercase tracking-wider whitespace-nowrap">
                                            Hôte principal
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-4 mt-2">
                                    {visitor.country && (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <CircleFlag countryCode={visitor.country.toLowerCase()} height={14} />
                                            <span className="text-xs font-bold uppercase">{visitor.country}</span>
                                        </div>
                                    )}
                                    {visitor.phone && (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Phone size={12} />
                                            <span className="text-[0.625rem] font-bold uppercase tracking-wider">{visitor.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <Label>Nom Complet</Label>
                                    <Input
                                        value={form.data.full_name}
                                        onChange={e => form.setData('full_name', e.target.value)}
                                        className={cn(form.errors.full_name && 'border-destructive')}
                                    />
                                    <InputError message={form.errors.full_name} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Pays</Label>
                                        <CountryDropdown
                                            defaultValue={form.data.country}
                                            onChange={val => form.setData('country', val)}
                                        />
                                        <InputError message={form.errors.country} />
                                    </div>
                                    <div>
                                        <Label>Téléphone</Label>
                                        <PhoneInput
                                            defaultCountry="ma"
                                            value={form.data.phone}
                                            onChange={val => form.setData('phone', val)}
                                            inputClassName={cn("w-full", form.errors.phone && 'border-destructive')}
                                            className="h-11"
                                        />
                                        <InputError message={form.errors.phone} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <Button 
                        type="button" 
                        variant={isEditing ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? "Annuler" : "Modifier"}
                    </Button>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t mt-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Documents & Pièces d'identité</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addDocument} className="gap-2">
                        <Plus className="h-4 w-4" /> Ajouter
                    </Button>
                </div>

                {form.data.documents?.map((doc: any, idx: number) => (
                    <div key={doc.id || `doc-${idx}`} className="p-4 border rounded-xl bg-muted/20 space-y-4 relative">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-3 right-0 h-8 w-8 rounded-full shadow-sm"
                            onClick={() => removeDocument(idx)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        {(doc.id && !doc.file && !isEditing) ? (
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <FileIcon className="h-6 w-6 text-brand-500" />
                                     <div>
                                         <p className="text-sm font-bold">{doc.type}</p>
                                         <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">Voir le document</a>
                                     </div>
                                 </div>
                             </div>
                        ) : (
                            <>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type de Document</Label>
                                        <Select value={doc.type} onValueChange={(val) => updateDocument(idx, 'type', val)}>
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
                                                id={`file-upload-${visitor.id}-${idx}`}
                                                onChange={(e) => handleFileChange(idx, e)}
                                            />
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                className="hidden"
                                                id={`camera-upload-${visitor.id}-${idx}`}
                                                onChange={(e) => handleFileChange(idx, e)}
                                            />
                                            <Button type="button" variant="outline" className="flex-1 h-11" asChild>
                                                <label htmlFor={`file-upload-${visitor.id}-${idx}`} className="cursor-pointer gap-2">
                                                    <Upload className="h-4 w-4" /> Parcourir
                                                </label>
                                            </Button>
                                            <Button type="button" variant="outline" className="flex-1 h-11" asChild>
                                                <label htmlFor={`camera-upload-${visitor.id}-${idx}`} className="cursor-pointer gap-2">
                                                    <Camera className="h-4 w-4" /> Caméra
                                                </label>
                                            </Button>
                                        </div>
                                        {form.errors[`documents.${idx}.file` as keyof VisitorFormData] && <InputError message={form.errors[`documents.${idx}.file` as keyof VisitorFormData]} />}
                                    </div>
                                </div>

                                {doc.url && (
                                    <div className="mt-4 flex justify-center border rounded-lg overflow-hidden bg-background">
                                        {doc.url.endsWith('.pdf') || (doc.file && doc.file.type === 'application/pdf') ? (
                                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground w-full">
                                                <FileIcon className="h-12 w-12 mb-2" />
                                                <span className="text-sm font-medium">Document PDF</span>
                                                {doc.id && <a href={doc.url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold mt-2 text-xs">Ouvrir le document</a>}
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-auto max-h-[300px] flex items-center justify-center p-2">
                                                <img src={doc.url} alt={`Document ${idx + 1}`} className="object-contain max-h-[300px] w-auto mix-blend-multiply dark:mix-blend-normal rounded" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {form.data.documents?.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-xl">
                        <p className="text-sm">Aucun document attaché</p>
                    </div>
                )}
            </div>

            {isEditing && (
                <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={form.processing} className="gap-2 bg-brand-500 hover:bg-brand-600">
                        {form.processing ? <ChevronDown className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Enregistrer les modifications
                    </Button>
                </div>
            )}
        </form>
    );
}
