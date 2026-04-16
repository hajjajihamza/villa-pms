import { ChevronDown, ChevronUp, Loader2, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { Advance } from '@/types/models';
import { AdvanceForm } from '../forms/advance-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateDisplay } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';
import AdvanceController from '@/actions/App/Http/Controllers/Reservation/AdvanceController';
import { router } from '@inertiajs/react';
import { queryClient } from '@/lib/query-client';
import { useMutation } from '@tanstack/react-query';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    reservationId: number;
    advances: Advance[];
    maxAmount?: number;
    defaultStatus: boolean;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function AdvanceSection({ reservationId, advances, maxAmount, defaultStatus = false }: Props) {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(defaultStatus);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAdvance, setEditingAdvance] = useState<Advance | null>(null);

    // ────────────────────────────────────────────────
    //  Query
    // ────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => router.delete(AdvanceController.destroy(id).url, {
            preserveScroll: true,
        }),
        onSuccess: () => {
            queryClient.resetQueries({ queryKey: ['reservation', reservationId] });
        },
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette avance ?')) {
            deleteMutation.mutate(id);
        }
    };

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
                                <Wallet size={13} className={isOpen ? "stroke-[2.5]" : ""} />
                            </div>
                            <span className='hover:underline'>Avances ({advances.length})</span>
                            {isOpen ? <ChevronUp size={13} className={cn("transition-transform duration-300", isOpen ? "" : "rotate-180")} /> : <ChevronDown size={13} className="transition-transform duration-300" />}
                        </h3>
                    </CollapsibleTrigger>

                    {!showAddForm && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsOpen(true);
                                setShowAddForm(!showAddForm);
                            }}
                        >
                            <Plus size={12} className="mr-1.5" />
                            Ajouter
                        </Button>
                    )}
                </div>

                {/* content */}
                <CollapsibleContent className="space-y-2 pt-1">
                    {/* form */}
                    {showAddForm && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <AdvanceForm
                                reservationId={reservationId}
                                advance={editingAdvance ?? undefined}
                                maxAmount={maxAmount}
                                onCancel={() => setShowAddForm(false)}
                                onSuccess={() => setShowAddForm(false)}
                            />
                        </div>
                    )}

                    {/* visitors list */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead className='text-right'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {advances.map((advance) => (
                                <TableRow key={advance.id}>
                                    <TableCell>{formatDateDisplay(advance.date)}</TableCell>
                                    <TableCell>{formatNumber(advance.amount, { endWith: 'DH' })}</TableCell>
                                    <TableCell className='text-right'>
                                        <Button className='mr-2' variant="info" size="icon" onClick={() => {
                                            setEditingAdvance(advance);
                                            setShowAddForm(true);
                                        }}>
                                            <Pencil size={10} />
                                        </Button>
                                        <Button variant="destructive" size="icon" disabled={deleteMutation.isPending} onClick={() => handleDelete(advance.id)}>
                                            {deleteMutation.isPending ? <Loader2 size={10} className='animate-spin' /> : <Trash2 size={10} />}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {advances.length === 0 && !showAddForm && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        <Button
                                            variant="link"
                                            className="mt-2 text-brand-600 font-extrabold text-[9px] uppercase tracking-widest px-0 h-auto"
                                            onClick={() => setShowAddForm(true)}
                                        >
                                            + Ajouter le premier avance
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CollapsibleContent>
            </Collapsible>
        </section>
    );
}
