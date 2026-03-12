import { router, usePage } from '@inertiajs/react';
import {
    CheckCheck, Clock, Edit3, Flag, Shield,
    ShieldCheck, Trash2, Calendar, User2
} from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDisplay } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';
import { cn } from '@/lib/utils';
import type { Reservation, ReservationStatus } from '@/types';

type Props = {
    reservation: Reservation;
    onOpenDetails: () => void;
    onEdit: (reservation: Reservation) => void;
};

export const StatusBadge: React.FC<{ status: ReservationStatus }> = ({ status }) => {
    const config = {
        CONFIRMED: { label: 'Confirmée', classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10', icon: ShieldCheck },
        CHECKED_OUT: { label: 'Terminé', classes: 'bg-slate-50 text-slate-600 dark:bg-slate-500/10', icon: CheckCheck },
        PENDING: { label: 'Attente', classes: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10', icon: Clock },
        CANCELLED: { label: 'Archivé', classes: 'bg-red-50 text-red-600 dark:bg-red-500/10', icon: Shield }
    };

    const { label, classes, icon: Icon } = config[status] || config.PENDING;

    return (
        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1", classes)}>
            <Icon size={12} />
            <span>{label}</span>
        </span>
    );
};

export default function ReservationRowCard({ reservation, onOpenDetails, onEdit }: Props) {
    const user = usePage().props.auth.user;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteNote, setDeleteNote] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const status = reservation.status ?? 'PENDING';
    const amountToPay = reservation.amount_to_pay ?? reservation.total_price ?? 0;

    const handleAction = (e: MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    const confirmDelete = () => {
        setProcessing(true);
        router.delete(ReservationController.destroy(reservation.id).url, {
            data: { deleted_note: deleteNote },
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDeleteNote('');
            },
            onFinish: () => setProcessing(false)
        });
    };

    return (
        <Card
            onClick={onOpenDetails}
            className="group relative flex flex-col sm:flex-row items-stretch overflow-hidden border-border/50 hover:bg-accent/5 transition-colors cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
        >
            {/* Left Color Accent (Vertical on Desktop, Top on Mobile) */}
            <div
                className="w-full h-1 sm:w-1.5 sm:h-auto shrink-0"
                style={{ backgroundColor: reservation.accommodation?.color ?? '#d4d4d8' }}
            />

            <div className="flex flex-1 flex-col sm:flex-row items-center gap-4 p-3 sm:py-2 sm:px-4">

                {/* 1. Guest & Accommodation Main Info */}
                <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User2 size={16} className="text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-foreground">
                            {reservation.main_visitor?.full_name ?? 'Visiteur'}
                        </h4>
                        <p className="truncate text-xs text-muted-foreground">
                            {reservation.accommodation?.name ?? 'Villa'} • {reservation.adults} Adulte{reservation.children > 0 && ` / ${reservation.children} Enfants`}
                        </p>
                    </div>
                </div>

                {/* 2. Stay Dates & Duration */}
                <div className="flex items-center gap-6 w-full sm:w-auto border-y sm:border-y-0 py-2 sm:py-0">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                            <Calendar size={10} /> Séjour
                        </span>
                        <p className="text-xs font-medium whitespace-nowrap">
                            {formatDateDisplay(reservation.check_in)}
                            <span className="mx-1 text-muted-foreground">→</span>
                            {formatDateDisplay(reservation.check_out)}
                        </p>
                    </div>
                    <div className="flex flex-col text-right sm:text-left">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Nuits</span>
                        <p className="text-xs font-medium">{reservation.duration ?? 0}</p>
                    </div>
                </div>

                {/* 3. Status & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto sm:min-w-[180px]">
                    <StatusBadge status={status} />
                    <div className="text-right">
                        <p className="text-sm font-black text-primary">
                            {formatNumber(amountToPay)} <span className="text-[10px]">DH</span>
                        </p>
                    </div>
                </div>

                {/* 4. Desktop-only Quick Actions (Hover visible or Subtle) */}
                <div className="flex items-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                    {/* <Button
                        title="Modifier"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground text-sky-600"
                        onClick={(e) => handleAction(e, () => onEdit(reservation))}
                    >
                        <Edit3 size={14} />
                    </Button> */}

                    {reservation.can_validate && reservation.status === 'PENDING' && (
                        <Button
                            title="Valider le séjour"
                            variant="outline"
                            size="icon"
                            className="h-8 w-10 text-emerald-600 hover:bg-emerald-50"
                            onClick={(e) => handleAction(e, () => router.patch(ReservationController.validateStay(reservation.id).url, {}, { preserveScroll: true }))}
                        >
                            <CheckCheck size={14} />
                        </Button>
                    )}

                    {reservation.status === 'CHECKED_OUT' && (
                        <Button
                            title={reservation.reported ? "Annuler la déclaration" : "Déclaré"}
                            variant="outline"
                            size="icon"
                            className={cn("h-8 w-10", reservation.reported ? "text-emerald-600" : "text-muted-foreground")}
                            onClick={(e) => handleAction(e, () => router.patch(ReservationController.toggleReported(reservation.id).url, {}, { preserveScroll: true }))}
                        >
                            {reservation.reported ? <ShieldCheck size={14} className="fill-current" /> : <Flag size={14} />}
                        </Button>
                    )}

                    {user.is_admin && !reservation.deleted_at && (
                        <Button
                            title="Supprimer"
                            variant="outline"
                            size="icon"
                            className="h-8 w-10 text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleAction(e, () => setIsDeleteDialogOpen(true))}
                        >
                            <Trash2 size={14} />
                        </Button>
                    )}
                </div>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle>Supprimer la réservation</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer la réservation de <strong>{reservation.main_visitor?.full_name}</strong> ?
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="note">Motif de suppression</Label>
                            <Input
                                id="note"
                                placeholder="Saisissez la raison de la suppression..."
                                value={deleteNote}
                                onChange={(e) => setDeleteNote(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={processing}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={processing}>
                            {processing ? 'Suppression...' : 'Supprimer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
