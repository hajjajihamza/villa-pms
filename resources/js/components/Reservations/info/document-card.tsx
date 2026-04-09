import { Pencil, Trash2, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Document } from '@/types/models';
import { useState } from 'react';
import { DocumentForm } from '../forms/document-form';
import { Badge } from '@/components/ui/badge';
import { formatDateDisplay } from '@/lib/format-date';
import { router } from '@inertiajs/react';
import VisitorController from '@/actions/App/Http/Controllers/Reservation/VisitorController';
import { queryClient } from '@/lib/query-client';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
  document: Document;
  reservationId: number;
}

// ────────────────────────────────────────────────
//  Constants
// ────────────────────────────────────────────────
const DOC_TYPE_LABELS: Record<string, string> = {
  'ID_CARD': 'Carte d\'identité',
  'PASSPORT': 'Passeport',
  'DRIVERS_LICENSE': 'Permis de conduire',
  'RESIDENCE_CARD': 'Carte de séjour',
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function DocumentCard({ document, reservationId }: Props) {
  // ────────────────────────────────────────────────
  //  States & variables
  // ────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const isImage = document.file_path.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  // ────────────────────────────────────────────────
  //  Handlers
  // ────────────────────────────────────────────────
  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      router.delete(VisitorController.destroyDocument.url(document.id), {
        preserveScroll: true,
        onSuccess: () => {
          if (reservationId) {
            queryClient.resetQueries({ queryKey: ['reservation', reservationId] });
          }
        },
      });
    }
  };

  // ────────────────────────────────────────────────
  //  Render edit form
  // ────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────
  //  Render document card
  // ────────────────────────────────────────────────
  return (
    <Card className="group relative overflow-hidden border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0f1117] shadow-[0_1px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.45)] transition-all duration-200 rounded-lg p-2">
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200/80 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.03] shrink-0">
          {isImage ? (
            <img
              src={document.url}
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
            href={document.url}
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
            <div>
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-1 h-3 rounded-full bg-brand-500 shrink-0" />
                <h4 className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 truncate tracking-wide">
                  {DOC_TYPE_LABELS[document.type] || document.type}
                </h4>
              </div>
              <Badge variant="secondary" className="text-[10px] mt-1">
                {formatDateDisplay(document.created_at)}
              </Badge>
            </div>

            <div className="flex items-center gap-0.5 transition-opacity shrink-0">
              <Button
                variant="info"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={10} />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                onClick={handleDelete}
              >
                <Trash2 size={10} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
