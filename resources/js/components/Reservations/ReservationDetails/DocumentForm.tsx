import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, X, FileUp, Camera } from 'lucide-react';
import { DocType } from '@/types/models';
import type { Document } from '@/types/models';
import { useState, useRef } from 'react';
import VisitorController from '@/actions/App/Http/Controllers/Reservation/VisitorController';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  visitorId: number;
  document?: Document;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'ID_CARD', label: 'Carte d\'identité' },
  { value: 'PASSPORT', label: 'Passeport' },
  { value: 'DRIVERS_LICENSE', label: 'Permis de conduire' },
  { value: 'RESIDENCE_CARD', label: 'Carte de séjour' },
];

export function DocumentForm({ visitorId, document, onCancel, onSuccess }: Props) {
  const isEditing = !!document;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(typeof document?.url === 'string' ? document.url : null);

  const { data, setData, post, processing, errors, reset } = useForm<{
    type: DocType;
    file: File | null;
    _method?: string;
  }>({
    type: document?.type || 'ID_CARD',
    file: null,
    ...(isEditing ? { _method: 'PUT' } : {}),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('file', file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEditing
      ? VisitorController.updateDocument.url(document.id)
      : VisitorController.storeDocument.url(visitorId);

    post(url, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setPreview(null);
        onSuccess?.();
      },
    });
  };

  return (
    <Card className="overflow-hidden border-brand-200 dark:border-brand-500/10 bg-brand-50/50 dark:bg-brand-500/5 shadow-sm">
      <form onSubmit={handleSubmit} className="p-2 sm:p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
            {isEditing ? 'Modifier Document' : 'Nouveau Document'}
          </h4>
          {onCancel && (
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 rounded-md text-slate-400 hover:text-slate-600"
                onClick={onCancel}
            >
                <X size={12} />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {/* Type Selection */}
          <div className="grid grid-cols-1 gap-1">
            <Label className="text-[8px] font-bold uppercase tracking-tight text-slate-500">Type de document</Label>
            <Select 
              value={data.type} 
              onValueChange={(val: DocType) => setData('type', val)}
            >
              <SelectTrigger className="h-7 text-[10px] bg-white dark:bg-dark-surface border-slate-200 dark:border-white/10">
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-[10px]">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-[8px] text-destructive font-medium">{errors.type}</p>}
          </div>

          {/* File Upload / Camera */}
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              capture="environment"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative h-20 w-full border-1.5 border-dashed rounded-md flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden",
                preview ? "border-brand-500" : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-brand-400 hover:bg-brand-50/50"
              )}
            >
              {preview ? (
                <div className="relative w-full h-full">
                  <img src={preview} alt="Prévisualisation" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <Camera size={16} className="mb-1" />
                    <span className="text-[8px] font-bold uppercase">Changer</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-dark-surface flex items-center justify-center shadow-sm text-brand-500 group-hover:scale-110 transition-transform">
                    <FileUp size={16} />
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Cliquer pour uploader</p>
                    <p className="text-[7px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">JPG, PNG, PDF (Max 5MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {errors.file && <p className="text-[8px] text-destructive font-medium">{errors.file}</p>}
        </div>

        <div className="flex justify-end gap-1.5 pt-2 border-t border-brand-100 dark:border-white/10 mt-1">
          {onCancel && (
            <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-7 text-[8px] font-bold uppercase tracking-tighter rounded-md"
                onClick={onCancel}
            >
                Annuler
            </Button>
          )}
          <Button 
            type="submit" 
            size="sm" 
            disabled={processing || (!data.file && !isEditing)}
            className="h-7 px-3 text-[9px] font-black uppercase tracking-tighter bg-brand-600 hover:bg-brand-700 text-white rounded-md shadow-sm"
          >
            {processing ? <Loader2 size={10} className="animate-spin mr-1" /> : <Save size={10} className="mr-1" />}
            {isEditing ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
