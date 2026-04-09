import { ChevronDown, ChevronUp, UserPlus, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { Visitor } from '@/types/models';
import { VisitorForm } from '../forms/visitor-form';
import { VisitorCard } from './visitor-card';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
  reservationId: number;
  visitors: Visitor[];
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function VisitorsSection({ reservationId, visitors }: Props) {
  // ────────────────────────────────────────────────
  //  States & variables
  // ────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // ────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────
  return (
    <section className="space-y-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
        {/* header */}
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <h3 className="text-[0.8rem] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 cursor-pointer group hover:text-slate-700 transition-colors">
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                isOpen ? "bg-brand-500 text-white shadow-brand-500/20 shadow-md ring-2 ring-brand-500/10" : "bg-slate-100 dark:bg-white/5 text-slate-400"
              )}>
                <Users size={13} className={isOpen ? "stroke-[2.5]" : ""} />
              </div>
              <span className='hover:underline'>Visiteurs ({visitors.length})</span>
              {isOpen ? <ChevronUp size={13} className={cn("transition-transform duration-300", isOpen ? "" : "rotate-180")} /> : <ChevronDown size={13} className="transition-transform duration-300" />}
            </h3>
          </CollapsibleTrigger>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsOpen(true);
              setShowAddForm(!showAddForm);
            }}
          >
            {showAddForm ? <X size={12} className="mr-1.5" /> : <UserPlus size={12} className="mr-1.5" />}
            {showAddForm ? 'Annuler' : 'Ajouter'}
          </Button>
        </div>

        {/* content */}
        <CollapsibleContent className="space-y-2 pt-1">
          {/* form */}
          {showAddForm && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <VisitorForm
                reservationId={reservationId}
                onCancel={() => setShowAddForm(false)}
                onSuccess={() => setShowAddForm(false)}
              />
            </div>
          )}

          {/* visitors list */}
          <div className="grid grid-cols-1 gap-2">
            {visitors.sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0)).map((visitor) => (
              <VisitorCard key={visitor.id} visitor={visitor} />
            ))}
          </div>

          {visitors.length === 0 && !showAddForm && (
            <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-2">
                <Users size={24} />
              </div>
              <p className="text-[0.65rem] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Aucun visiteur
              </p>
              <Button
                variant="link"
                className="mt-2 text-brand-600 font-extrabold text-[9px] uppercase tracking-widest px-0 h-auto"
                onClick={() => setShowAddForm(true)}
              >
                + Ajouter le premier visiteur
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
