import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { CountryDropdown } from '../ui/country-dropdown';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Camera, Upload, File as FileIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { DocType } from '@/types/models';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChangeEvent, useRef } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';

type Props = {
  data: any;
  setData: (key: any, value?: any) => void;
  errors: any;
};

export default function StepVisitor({ data, setData, errors }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDocument = () => {
    setData('documents', [
      ...(data.documents || []),
      { type: 'ID_CARD', url: null, file: null }
    ]);
  };

  const removeDocument = (index: number) => {
    const docs = [...data.documents];
    const doc = docs[index];
    if (doc.id) {
      confirm("Êtes-vous sûr de vouloir supprimer ce document ?") && router.delete(ReservationController.destroyDocument(doc.id).url, {
           onSuccess: () => {
               docs.splice(index, 1);
               setData('documents', docs);
           }
       });
    } else {
        if (doc.url) URL.revokeObjectURL(doc.url);
        docs.splice(index, 1);
        setData('documents', docs);
    }
  };

  const updateDocument = (index: number, key: string, value: any) => {
    const docs = [...data.documents];
    docs[index][key] = value;
    setData('documents', docs);
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
      
      docs[index].file = file;
      docs[index].url = url;
      setData('documents', docs);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="full_name">Nom Complet</Label>
        <Input
          id="expense-name"
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

      <div className="space-y-4 pt-4 border-t mt-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Documents & Pièces d'identité</Label>
          <Button type="button" variant="outline" size="sm" onClick={addDocument} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un document
          </Button>
        </div>

        {data.documents?.map((doc: any, index: number) => (
          <div key={doc.id || `doc-${index}`} className="p-4 border rounded-xl bg-muted/20 space-y-4 relative">
             <Button 
                type="button" 
                variant="destructive" 
                size="icon"
                className="absolute -top-3 right-0 h-8 w-8 rounded-full shadow-sm"
                onClick={() => removeDocument(index)}
             >
                <Trash2 className="h-4 w-4" />
             </Button>

             <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Type de Document</Label>
                    <Select value={doc.type} onValueChange={(val) => updateDocument(index, 'type', val)}>
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
                            id={`file-upload-${index}`}
                            onChange={(e) => handleFileChange(index, e)}
                        />
                        <Input 
                            type="file" 
                            accept="image/*"
                            capture="environment"
                            className="hidden" 
                            id={`camera-upload-${index}`}
                            onChange={(e) => handleFileChange(index, e)}
                        />
                        <Button type="button" variant="outline" className="flex-1 h-11" asChild>
                            <label htmlFor={`file-upload-${index}`} className="cursor-pointer gap-2">
                                <Upload className="h-4 w-4" /> Parcourir
                            </label>
                        </Button>
                        <Button type="button" variant="outline" className="flex-1 h-11" asChild>
                            <label htmlFor={`camera-upload-${index}`} className="cursor-pointer gap-2">
                                <Camera className="h-4 w-4" /> Caméra
                            </label>
                        </Button>
                    </div>
                    {errors[`documents.${index}.file`] && <InputError message={errors[`documents.${index}.file`]} />}
                    {errors[`documents.${index}.type`] && <InputError message={errors[`documents.${index}.type`]} />}
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
                            <img src={doc.url} alt={`Document ${index + 1}`} className="object-contain max-h-[300px] w-auto mix-blend-multiply dark:mix-blend-normal rounded" />
                        </div>
                    )}
                </div>
             )}
          </div>
        ))}

        {data.documents?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                <p className="text-sm">Aucun document ajouté</p>
                <p className="text-xs mt-1">Cliquez sur 'Ajouter un document' pour joindre une pièce d'identité</p>
            </div>
        )}
      </div>

    </div>
  );
}