import { useState } from 'react';
import { CircleFlag } from 'react-circle-flags';
import getName from 'i18n-iso-countries';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import { Pencil, Trash2, Phone, User, Plus, FileText, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Visitor } from '@/types/models';
import { visitorService } from '@/api/visitorService';
import { VisitorForm } from '../ReservationForm/VisitorForm';
import { DocumentCard } from './DocumentCard';
import { DocumentForm } from '../ReservationForm/DocumentForm';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

getName.registerLocale(frLocale);

interface Props {
  visitor: Visitor;
}

export function VisitorCard({ visitor }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const countryName = visitor.country ? getName.getName(visitor.country, 'fr') : 'Inconnu';

  const handleDelete = () => {
    visitorService.destroy(visitor.id, visitor.reservation_id);
  };

  if (isEditing) {
    return (
      <VisitorForm
        reservationId={visitor.reservation_id}
        visitor={visitor}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 border",
        visitor.is_main
          ? [
            "bg-gradient-to-br from-indigo-50/60 via-white to-white",
            "dark:from-indigo-500/[0.07] dark:via-dark-surface dark:to-dark-surface",
            "border-indigo-200/70 dark:border-indigo-500/20",
            "shadow-[0_2px_12px_-2px_rgba(99,102,241,0.15)]",
            "ring-1 ring-indigo-500/10 dark:ring-indigo-500/10",
          ].join(" ")
          : [
            "bg-white dark:bg-dark-surface",
            "border-slate-200/80 dark:border-white/[0.06]",
            "shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
          ].join(" ")
      )}
    >
      <div className="p-3">

        {/* ── Header Row ── */}
        <div className="flex items-center gap-2.5">

          {/* Avatar */}
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              visitor.is_main
                ? "bg-indigo-500 shadow-[0_2px_6px_rgba(99,102,241,0.4)] text-white"
                : "bg-slate-100 dark:bg-white/[0.06] text-slate-400"
            )}
          >
            <User size={14} strokeWidth={visitor.is_main ? 2.5 : 2} />
          </div>

          {/* Name + meta */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 leading-none mb-1">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[140px]">
                {visitor.full_name}
              </span>
              {visitor.is_main && (
                <span className="inline-flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                  <Star size={7} fill="currentColor" strokeWidth={0} />
                  Responsable
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {visitor.country && (
                <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.08] rounded-full px-1.5 py-0.5">
                  <CircleFlag
                    countryCode={visitor.country.toLowerCase()}
                    height={9} width={9}
                    className="rounded-full"
                  />
                  <span className="text-[8.5px] font-semibold text-slate-500 dark:text-slate-400">
                    {countryName}
                  </span>
                </div>
              )}
              {visitor.phone && (
                <div className="inline-flex items-center gap-1">
                  <Phone size={7} className="text-indigo-400" />
                  <span className="text-[8.5px] font-medium text-slate-500 dark:text-slate-400">
                    {visitor.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0 self-start">
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="outline"
              title="Modifier"
              className="h-8 w-8 text-muted-foreground hover:text-foreground text-sky-600"
            >
              <Pencil size={11} />
            </Button>
            {!visitor.is_main && (
              <Button
                onClick={handleDelete}
                size="sm"
                variant="outline"
                title="Supprimer"
                className="h-8 w-10 text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={11} />
              </Button>
            )}
          </div>
        </div>

        {/* ── Documents Section ── */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
          <Collapsible open={isDocsOpen} onOpenChange={setIsDocsOpen}>

            <div className="flex items-center justify-between">
              {/* Trigger */}
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1.5 group outline-none">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                      (visitor.documents?.length || 0) > 0
                        ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-slate-50 text-slate-300 dark:bg-white/[0.04] dark:text-slate-500"
                    )}
                  >
                    <FileText size={10} />
                  </div>
                  <span className="text-[8.5px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    Docs ({visitor.documents?.length || 0})
                  </span>
                  {isDocsOpen
                    ? <ChevronUp size={9} className="text-slate-300 dark:text-slate-600" />
                    : <ChevronDown size={9} className="text-slate-300 dark:text-slate-600" />
                  }
                </button>
              </CollapsibleTrigger>

              {/* Add Doc */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDocsOpen(true);
                  setShowDocForm(true);
                }}
                size='sm'
                variant="outline"
                disabled={showDocForm}
                className={cn(
                  "inline-flex items-center gap-0.5 h-7 px-1.5 rounded-md",
                  "text-[8px] font-bold uppercase tracking-widest",
                  "text-indigo-500 text-indigo-700 bg-indigo-50",
                  "border border-transparent border-indigo-200/50",
                  "transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
                )}
              >
                <Plus size={9} strokeWidth={2.5} />
                Ajouter
              </Button>
            </div>

            <CollapsibleContent className="mt-2 space-y-2">
              {showDocForm && (
                <DocumentForm
                  visitorId={visitor.id}
                  reservationId={visitor.reservation_id}
                  onCancel={() => setShowDocForm(false)}
                  onSuccess={() => setShowDocForm(false)}
                />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {visitor.documents?.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} reservationId={visitor.reservation_id} />
                ))}
              </div>
              {visitor.documents?.length === 0 && (
                <p className="text-[8.5px] font-semibold text-center uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Aucun document trouvé</p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

      </div>
    </Card>
  );
}
