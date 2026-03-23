import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pencil, Trash2, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { documentService } from '@/services/documentService';
import type { Document } from '@/types/models';
import { useState } from 'react';
import { DocumentForm } from './DocumentForm';

interface Props {
  document: Document;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  'ID_CARD': 'Carte d\'identité',
  'PASSPORT': 'Passeport',
  'DRIVERS_LICENSE': 'Permis de conduire',
  'RESIDENCE_CARD': 'Carte de séjour',
};

export function DocumentCard({ document }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    documentService.destroy(document.id);
  };

  if (isEditing) {
    return (
      <DocumentForm
        visitorId={document.visitor_id}
        document={document}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    );
  }

  const isImage = document.file_path.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <Card className="group relative overflow-hidden border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm transition-all hover:shadow-md">
      <div className="flex gap-2.5 p-1.5">
        {/* Preview / Thumbnail */}
        <div className="relative w-14 h-14 rounded-md overflow-hidden border bg-muted shrink-0 shadow-inner">
          {isImage ? (
            <img 
              src={typeof document.url === 'string' ? document.url : ''} 
              alt={document.type} 
              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
              <FileText size={20} className="text-slate-400" />
              <span className="text-[6px] font-bold text-slate-500 uppercase mt-0.5">PDF</span>
            </div>
          )}
          
          <a 
            href={typeof document.url === 'string' ? document.url : '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-0.5 py-0.5">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-[9px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">
              {DOC_TYPE_LABELS[document.type] || document.type}
            </h4>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md text-slate-500 hover:text-brand-600 hover:bg-brand-50"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={10} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 size={10} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-[8px] text-slate-500 font-medium">
            <CheckCircle2 size={8} className="text-emerald-500" />
            <span>{format(new Date(document.created_at), 'dd/MM/yy', { locale: fr })}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
