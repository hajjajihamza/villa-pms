import { useForm } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
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
  reservationId?: number;
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

export function DocumentForm({ visitorId, reservationId, document, onCancel, onSuccess }: Props) {
  const isEditing = !!document;
  const queryClient = useQueryClient();
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
        if (reservationId) {
          queryClient.resetQueries({ queryKey: ['reservation', reservationId] });
        }
        reset();
        setPreview(null);
        onSuccess?.();
      },
    });
  };

  return (
    <Card className="overflow-hidden border border-slate-200/80 dark:border-white/[0.06] py-1 bg-white dark:bg-[#0f1117] shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.4)] rounded-xl">
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.05]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-brand-500" />
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              {isEditing ? 'Modifier le document' : 'Nouveau document'}
            </h4>
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
              onClick={onCancel}
            >
              <X size={12} />
            </Button>
          )}
        </div>

        <div className="space-y-3">

          {/* Type Selection */}
          <div className="space-y-1.5">
            <Label className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
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
            {errors.type && (
              <p className="text-[9px] text-rose-500 font-medium flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                {errors.type}
              </p>
            )}
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
            {errors.file && (
              <p className="text-[9px] text-rose-500 font-medium flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                {errors.file}
              </p>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={processing || (!data.file && !isEditing)}
          >
            {processing
              ? <Loader2 size={11} className="animate-spin mr-1.5" />
              : <Save size={11} className="mr-1.5" />
            }
            {isEditing ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>

      </form>
    </Card>
  );
}
