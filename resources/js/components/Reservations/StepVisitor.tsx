import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { CountryDropdown } from '../ui/country-dropdown';
import { router } from '@inertiajs/react';
import { ChangeEvent, useRef } from 'react';
import VisitorController from '@/actions/App/Http/Controllers/Reservation/VisitorController';
import { useReservation } from './ReservationContext';
import { VisitorDocumentSection } from './ReservationDetails/VisitorDocumentSection';

export default function StepVisitor() {
  const { form: { data, setData, errors } } = useReservation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDocument = () => {
    setData('documents', [
      { type: 'ID_CARD', url: undefined, file: null, tempId: `new-${Date.now()}` },
      ...(data.documents || [])
    ] as any);
  };

  const removeDocument = (index: number) => {
    const docs = [...data.documents];
    const doc = docs[index];
    if (doc.id) {
      confirm("Êtes-vous sûr de vouloir supprimer ce document ?") && router.delete(VisitorController.destroyDocument(doc.id).url, {
           onSuccess: () => {
               docs.splice(index, 1);
               setData('documents', docs as any);
           }
       });
    } else {
        if (doc.url) URL.revokeObjectURL(doc.url);
        docs.splice(index, 1);
        setData('documents', docs as any);
    }
  };

  const updateDocument = (index: number, key: string, value: any) => {
    const docs = [...data.documents];
    docs[index] = { ...docs[index], [key]: value };
    setData('documents', docs as any);
  };

  const handleFileChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
          alert("Le fichier est trop volumineux (max 5MB)");
          return;
      }
      const url = URL.createObjectURL(file);
      const docs = [...data.documents];
      const oldUrl = docs[index].url;
      if (oldUrl && !docs[index].id) URL.revokeObjectURL(oldUrl); // Revoke only if it's a blob URL
      
      docs[index] = { ...docs[index], file, url };
      setData('documents', docs as any);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="full_name">Nom Complet</Label>
        <Input
          required
          value={data.full_name}
          onChange={(e) => setData('full_name', e.target.value)}
          placeholder="Nom du visiteur"
          className={cn(
            'h-11 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
            errors.full_name &&
            'border-destructive',
          )}
        />
        <InputError message={errors.full_name} />
      </div>

      <div className='grid lg:grid-cols-2 gap-4'>
        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <CountryDropdown
            placeholder="Sélectionner un pays"
            defaultValue={data.country}
            onChange={(country) => setData('country', country)}
          />
          <InputError message={errors.country} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold">Téléphone (Optionnel)</Label>

          <PhoneInput
            defaultCountry="ma"
            value={data.phone}
            onChange={(phone) => setData('phone', phone)}
            inputClassName={cn(
              "w-full",
              errors.phone && "border-destructive"
            )}
            className='h-11'
          />
          <InputError message={errors.phone} />
        </div>
      </div>

      <VisitorDocumentSection
        documents={data.documents || []}
        onAdd={addDocument}
        onRemove={removeDocument}
        onUpdate={updateDocument}
        onFileChange={handleFileChange}
        errors={errors}
        baseId="step-visitor"
        isEditing={true}
      />

      {(!data.documents || data.documents.length === 0) && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl mt-4">
          <p className="text-sm">Aucun document ajouté</p>
          <p className="text-xs mt-1">Cliquez sur 'Ajouter un document' pour joindre une pièce d'identité</p>
        </div>
      )}
    </div>
  );
}