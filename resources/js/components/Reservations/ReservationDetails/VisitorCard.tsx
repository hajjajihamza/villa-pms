import { useState } from 'react';
import { CircleFlag } from 'react-circle-flags';
import getName from 'i18n-iso-countries';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import { Pencil, Trash2, Phone, User, Plus, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Visitor } from '@/types/models';
import { visitorService } from '@/services/visitorService';
import { VisitorForm } from './VisitorForm';
import { DocumentCard } from './DocumentCard';
import { DocumentForm } from './DocumentForm';
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
    visitorService.destroy(visitor.id);
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
    <Card className={cn(
      "overflow-hidden border-slate-200 dark:border-white/5 transition-all duration-300",
      visitor.is_main 
        ? "bg-gradient-to-br from-brand-50/50 to-white dark:from-brand-500/10 dark:to-dark-surface border-brand-200 dark:border-brand-500/20 shadow-brand-500/5 ring-1 ring-brand-500/5 shadow-md" 
        : "bg-white dark:bg-dark-surface"
    )}>
      <div className="p-2 sm:p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Avatar / Icon */}
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0",
              visitor.is_main 
                ? "bg-brand-500 text-white" 
                : "bg-slate-100 dark:bg-white/5 text-slate-500"
            )}>
              <User size={16} className={visitor.is_main ? "stroke-[2.5]" : ""} />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {visitor.full_name}
                </span>
                {visitor.is_main && (
                  <Badge className="bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 text-[8px] uppercase tracking-tighter font-black px-1.5 py-0">
                    Responsable
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {visitor.country && (
                  <div className="flex items-center gap-1 py-0 px-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/10">
                    <CircleFlag countryCode={visitor.country.toLowerCase()} height={10} width={10} className="rounded-full shadow-sm" />
                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">{countryName}</span>
                  </div>
                )}
                {visitor.phone && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                    <Phone size={8} className="text-brand-500" />
                    <span>{visitor.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 rounded-md border-slate-200 dark:border-white/10 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:text-brand-600 transition-all font-bold text-[9px] uppercase tracking-tighter"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={12} className="mr-1" /> Modifier
            </Button>
            {!visitor.is_main && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 rounded-md border-slate-200 dark:border-white/10 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-[9px] uppercase tracking-tighter"
                onClick={handleDelete}
              >
                <Trash2 size={12} className="mr-1" /> Supprimer
              </Button>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
          <Collapsible open={isDocsOpen} onOpenChange={setIsDocsOpen}>
            <div className="flex items-center justify-between mb-2">
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer group">
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                    (visitor.documents?.length || 0) > 0 
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                      : "bg-slate-50 text-slate-400 dark:bg-white/5"
                  )}>
                    <FileText size={12} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tight text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Docs ({visitor.documents?.length || 0})
                  </span>
                  {isDocsOpen ? <ChevronUp size={10} className="text-slate-400" /> : <ChevronDown size={10} className="text-slate-400" />}
                </div>
              </CollapsibleTrigger>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[8px] font-black uppercase tracking-tighter text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all rounded-md"
                onClick={(e) => {
                   e.stopPropagation();
                   setIsDocsOpen(true);
                   setShowDocForm(true);
                }}
                disabled={showDocForm}
              >
                <Plus size={10} className="mr-0.5" /> Ajouter Doc
              </Button>
            </div>

            <CollapsibleContent className="space-y-2">
              {showDocForm && (
                <DocumentForm
                  visitorId={visitor.id}
                  onCancel={() => setShowDocForm(false)}
                  onSuccess={() => setShowDocForm(false)}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {visitor.documents?.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </Card>
  );
}
