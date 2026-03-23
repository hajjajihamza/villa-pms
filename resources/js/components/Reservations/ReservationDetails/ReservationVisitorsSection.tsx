import {
    Users, ChevronDown, ChevronUp, Plus
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Reservation } from '@/types';
import { VisitorForm } from '../ReservationForm/VisitorForm';
import { VisitorCard } from './VisitorCard';

interface Props {
    reservation: Reservation;
}

export function ReservationVisitorsSection({ reservation }: Props) {
    const [isGuestsExpanded, setIsGuestsExpanded] = useState(false);
    const [showAddVisitor, setShowAddVisitor] = useState(false);

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsGuestsExpanded(!isGuestsExpanded)}
                    className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-brand-500 shrink-0">
                            <Users size={15} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-foreground">Dossiers visiteurs</p>
                            <p className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider">
                                {(reservation.visitors || []).length} profils enregistrés
                            </p>
                        </div>
                    </div>
                    <div className="text-muted-foreground transition-transform duration-200 group-hover:rotate-180">
                        {isGuestsExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                </button>

                <Button
                    onClick={() => { setShowAddVisitor(!showAddVisitor); setIsGuestsExpanded(true); }}
                    variant="outline"
                    title='Ajouter un visiteur'
                    className="h-full px-4 rounded-lg border-border shrink-0 text-brand-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30"
                >
                    <Plus size={15} />
                </Button>
            </div>

            {isGuestsExpanded && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {showAddVisitor && (
                        <VisitorForm
                            reservationId={reservation.id}
                            onSuccess={() => setShowAddVisitor(false)}
                            onCancel={() => setShowAddVisitor(false)}
                        />
                    )}


                    <div className="grid grid-cols-1 gap-6 mt-4">
                        {(reservation.visitors || []).map((guest: any, idx: number) => (
                            <VisitorCard key={guest.id} visitor={guest} index={idx} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
