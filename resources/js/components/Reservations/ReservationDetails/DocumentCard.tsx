import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pencil, Trash2, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { documentService } from '@/api/documentService';
import type { Document } from '@/types/models';
import { useState } from 'react';
import { DocumentForm } from '../ReservationForm/DocumentForm';

interface Props {
  document: Document;
  reservationId: number;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  'ID_CARD': 'Carte d\'identité',
  'PASSPORT': 'Passeport',
  'DRIVERS_LICENSE': 'Permis de conduire',
  'RESIDENCE_CARD': 'Carte de séjour',
};

export function DocumentCard({ document, reservationId }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    documentService.destroy(document.id);
  };

  if (isEditing) {
    return (
      <DocumentForm
        visitorId={document.visitor_id}
        document={document}
        reservationId={reservationId}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    );
  }

  const isImage = document.file_path.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <Card className="group relative overflow-hidden border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0f1117] shadow-[0_1px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.45)] transition-all duration-200 rounded-xl">
      <div className="flex gap-3 p-3">

        {/* Thumbnail */}
        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200/80 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.03] shrink-0">
          {isImage ? (
            <img
              src={typeof document.url === 'string' ? document.url : ''}
              alt={document.type}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-0.5">
              <FileText size={18} className="text-slate-400 dark:text-slate-500" />
              <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">PDF</span>
            </div>
          )}

          <a
            href={typeof document.url === 'string' ? document.url : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white"
          >
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">

          {/* Top row: label + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-1 h-3 rounded-full bg-brand-500 shrink-0" />
              <h4 className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate tracking-wide">
                {DOC_TYPE_LABELS[document.type] || document.type}
              </h4>
            </div>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={10} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                onClick={handleDelete}
              >
                <Trash2 size={10} />
              </Button>
            </div>
          </div>

          {/* Bottom row: status + date */}
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">
              {format(new Date(document.created_at), 'dd/MM/yyyy', { locale: fr })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
