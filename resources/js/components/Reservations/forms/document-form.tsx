import { useForm } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, X, FileUp, Camera } from 'lucide-react';
import { DocType } from '@/types/models';
import type { Document } from '@/types/models';
import { useState, useRef, useEffect, type SubmitEvent } from 'react';
import VisitorController from '@/actions/App/Http/Controllers/Reservation/VisitorController';
import { Card, CardAction, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import InputError from '@/components/input-error';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
  visitorId: number;
  reservationId?: number;
  document?: Document;
  onCancel?: () => void;
  onSuccess?: () => void;
}

// ────────────────────────────────────────────────
//  Constants
// ────────────────────────────────────────────────
const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'ID_CARD', label: 'Carte d\'identité' },
  { value: 'PASSPORT', label: 'Passeport' },
  { value: 'DRIVERS_LICENSE', label: 'Permis de conduire' },
  { value: 'RESIDENCE_CARD', label: 'Carte de séjour' },
];

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function DocumentForm({ visitorId, reservationId, document, onCancel, onSuccess }: Props) {
  // ────────────────────────────────────────────────
  //  States & variables
  // ────────────────────────────────────────────────
  const isEditing = !!document;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(document?.url);

  const { data, setData, post, processing, errors, reset } = useForm<{
    type: DocType;
    file: File | null;
    _method?: string; 
  }>({
    type: document?.type || 'ID_CARD',
    file: null,
    ...(isEditing ? { _method: 'PUT' } : {}),// pour la mise à jour
  });

  // ────────────────────────────────────────────────
  //  Handlers
  // ────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('file', file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(undefined);
      }
    }
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    const url = isEditing
      ? VisitorController.updateDocument.url(document.id)
      : VisitorController.storeDocument.url(visitorId);

    post(url, {
      forceFormData: true, // pour l'envoi de fichier
      preserveScroll: true, // pour ne pas perdre le scroll
      onSuccess: () => {
        if (reservationId) {
          queryClient.resetQueries({ queryKey: ['reservation', reservationId] });
        }
        reset();
        setPreview(undefined);
        onSuccess?.();
      },
    });
  };

  // ────────────────────────────────────────────────
  //  Effects
  // ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      reset();
      setPreview(undefined);
    };
  }, []);

  // ────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────
  return (
    <Card className="overflow-hidden border-border bg-card shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all dark:bg-card/50 p-0 gap-0">
      <CardHeader className="border-b border-border pt-3 [.border-b]:pb-2">
        <CardTitle className="text-[14px] font-bold">
          {isEditing ? 'Modifier Document' : 'Nouveau Document'}
        </CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            <X />
          </Button>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit} className="p-2 space-y-2">
        {/* Type Selection */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              Type de document
            </Label>
            <Select
              value={data.type}
              onValueChange={(val: DocType) => setData('type', val)}
            >
              <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.07] rounded-lg text-slate-700 dark:text-slate-300 hover:border-brand-400 dark:hover:border-brand-500/50 transition-colors focus:ring-1 focus:ring-brand-500/30">
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-white/10 shadow-xl">
                {DOC_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-xs rounded-lg">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={errors.type} />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <Label className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              Fichier
            </Label>
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
                "group relative h-24 w-full rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden",
                preview
                  ? "border border-brand-400/60 dark:border-brand-500/40 ring-2 ring-brand-500/10"
                  : "border border-dashed border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] hover:border-brand-400/70 dark:hover:border-brand-500/40 hover:bg-brand-50/40 dark:hover:bg-brand-500/[0.04]"
              )}
            >
              {preview ? (
                <div className="relative w-full h-full">
                  <img src={preview} alt="Prévisualisation" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center text-white gap-1">
                    <Camera size={14} className="opacity-90" />
                    <span className="text-[8px] font-semibold uppercase tracking-widest opacity-80">Changer</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center shadow-sm text-brand-500 group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
                    <FileUp size={15} />
                  </div>
                  <div className="text-center space-y-0.5">
                    <p className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                      Cliquer pour uploader
                    </p>
                    <p className="text-[8px] text-slate-400 dark:text-slate-600 tracking-wider uppercase">
                      JPG · PNG · PDF — max 5 MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            <InputError message={errors.file} />
          </div>

        {/* Footer Actions */}
        <CardFooter className="grid gap-2 border-t bg-muted/30 [.border-t]:pt-2 px-2 sm:grid-cols-1 md:grid-cols-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              <X size={12} className="mr-1.5" />
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            disabled={processing || (!data.file && !isEditing)}
          >
            {processing
              ? <Loader2 size={12} className="animate-spin mr-1.5" />
              : <Save size={12} className="mr-1.5" />
            }
            {isEditing ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
