import { usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Calendar, MapPin, Users, Globe, ShieldCheck,
    FileText, CheckCircle2,
    Printer, Info, Trash2,
    Moon,
    HandCoins,
    Clock,
    UserPlus
} from 'lucide-react';
import { useState, Suspense } from 'react';
import ReservationModalSkeleton from '@/components/Reservations/ReservationSkeleton/ReservationModalSkeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReservationDetails } from '@/hooks/use-reservation-details';
import { formatDateDisplay } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/types';
import { Card } from '../../ui/card';
import { StatusBadge } from '../ReservationList/ReservationCard';
import { ReservationInvoice } from './ReservationInvoice';
import { VisitorsSection } from './VisitorsSection';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservationId: number;
};

export default function ReservationModal({ open, onOpenChange, reservationId }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-0 p-0 shadow-2xl sm:max-w-4xl overflow-hidden bg-background">
                <Suspense fallback={<div className="p-8"><ReservationModalSkeleton /></div>}>
                    <ReservationDetailsContent reservationId={reservationId} />
                </Suspense>
            </DialogContent>
        </Dialog>
    );
}

function ReservationDetailsContent({ reservationId }: { reservationId: number }) {
    const reservation = useReservationDetails(reservationId).data as Reservation;

    const user = usePage().props.auth.user;
    const [showInvoice, setShowInvoice] = useState(false);

    const selectedAcc = reservation.accommodation;
    const selectedChannel = reservation.channel;

    const housingTotal = reservation.total_price || 0;
    const invoiceTotal = Number(reservation.amount_to_pay || 0) + Number(reservation.advance_amount || 0);

    const commissionRate = selectedChannel?.commission || 0;
    const commissionAmount = (housingTotal * commissionRate) / 100;

    const accentColor = reservation.accommodation?.color || '#3b82f6';
    const visitorName = reservation.main_visitor?.full_name || 'Client Inconnu';

    return (
        <>
            <DialogHeader className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/5 bg-gradient-to-br from-white to-slate-50/50 dark:from-dark-surface dark:to-dark-surface/50 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Avatar with dynamic glow */}
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-2xl shrink-0 transition-transform hover:scale-105"
                        style={{
                            backgroundColor: accentColor,
                            boxShadow: `0 10px 25px -5px ${accentColor}40`
                        }}
                    >
                        {visitorName.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {visitorName}
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={reservation.status || 'PENDING'} />
                                {reservation.reported && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-500/20">
                                        <ShieldCheck size={12} className="stroke-[3]" />
                                        Déclaré
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {user.is_admin && (
                                <p className="flex items-center gap-2">
                                    <UserPlus size={14} />
                                    Créé par : <span className="text-slate-700 dark:text-slate-200 font-mono">{reservation.creator?.name}</span>
                                </p>
                            )}

                            <p className="flex items-center gap-2">
                                <Clock size={14} />
                                Créé le : <span className="text-slate-700 dark:text-slate-200 font-mono">{format(new Date(reservation.created_at), 'dd/MM/yyyy HH:mm') || 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </DialogHeader>

            <ScrollArea className="px-8 max-h-[60vh] overflow-y-auto">
                <div className="p-2 space-y-3 pb-5">
                    {/* Main Content Area */}
                    <div className="space-y-4">
                        {/* Section: Visiteurs */}
                        <VisitorsSection reservationId={reservationId} visitors={reservation.visitors ?? []} />

                        {/* Section: Détails du Séjour */}
                        <section className="space-y-2">
                            <h3 className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <Info size={11} className="opacity-60" />
                                Détails du séjour
                            </h3>

                            <Card className="overflow-hidden p-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 divide-y divide-border sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(odd)]:border-border">

                                    {/* Hébergement */}
                                    <div className="flex items-center gap-3 p-4">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0" style={{ color: selectedAcc?.color }}>
                                            <MapPin size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider mb-1">Hébergement</p>
                                            <p className="text-sm font-medium text-foreground truncate">{selectedAcc?.name}</p>
                                        </div>
                                    </div>

                                    {/* Période Prévue */}
                                    <div className="flex items-center gap-3 p-4">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-blue-500">
                                            <Calendar size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider mb-1">Période prévue</p>
                                            <p className="text-sm font-medium text-foreground">
                                                {formatDateDisplay(reservation.check_in)}
                                                <span className="text-muted-foreground mx-1">→</span>
                                                {formatDateDisplay(reservation.check_out)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Période Réelle */}
                                    <div className="flex items-center gap-3 p-4">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0",
                                            (reservation.real_check_in || reservation.real_check_out) ? "text-emerald-500" : "text-muted-foreground/40"
                                        )}>
                                            <CheckCircle2 size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider mb-1">Période réelle</p>
                                            {(reservation.real_check_in || reservation.real_check_out) ? (
                                                <>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {reservation.real_check_in ? formatDateDisplay(reservation.real_check_in) : '—'}
                                                        <span className="text-muted-foreground mx-1">→</span>
                                                        {reservation.real_check_out ? formatDateDisplay(reservation.real_check_out) : '—'}
                                                    </p>
                                                    <span className="inline-flex items-center gap-1 mt-1 text-[0.6rem] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                                        <CheckCircle2 size={9} /> Confirmé
                                                    </span>
                                                </>
                                            ) : (
                                                <p className="text-sm text-muted-foreground/40">—</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Durée */}
                                    <div className="flex items-center gap-3 p-4">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-amber-500">
                                            <Moon size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider mb-1">Durée</p>
                                            <p className="text-sm font-medium text-foreground">
                                                {reservation.duration} {Number(reservation.duration) > 1 ? 'nuits' : 'nuit'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Voyageurs */}
                                    <div className="flex items-center gap-3 p-4 sm:col-span-2 sm:border-r-0">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-brand-500">
                                            <Users size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider mb-1">Vistitors</p>
                                            <p className="text-sm font-medium text-foreground">
                                                {reservation.adults} Adulte{Number(reservation.adults) > 1 ? 's' : ''} {Number(reservation.children) > 0 && ` / ${reservation.children} Enfants`}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </Card>
                        </section>

                        {/* ADMIN ONLY: Détails Financiers */}
                        {user.is_admin && (
                            <section className="space-y-2">
                                <h3 className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldCheck size={11} className="opacity-60" />
                                    Détails financiers
                                </h3>

                                <Card className="overflow-hidden p-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">

                                        {/* Distribution */}
                                        <div className="p-4 space-y-3">
                                            <p className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                <Globe size={11} className="text-blue-500" />
                                                Distribution
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider">Canal</span>
                                                    <span className="text-sm font-medium text-foreground">{selectedChannel?.name || 'Direct'}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                                                    <span className="text-[0.6rem] font-medium text-blue-500 uppercase tracking-wider">
                                                        Commission ({formatNumber(commissionRate, { endWith: '%' })})
                                                    </span>
                                                    <span className="text-sm font-medium text-blue-500">
                                                        {formatNumber(commissionAmount, { endWith: 'DH' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Frais de service */}
                                        <div className="p-4 space-y-3">
                                            <p className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                <HandCoins size={11} className="text-violet-500" />
                                                Frais de service
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider">Prix / nuit</span>
                                                    <span className="text-sm font-medium text-foreground">
                                                        {formatNumber(reservation.service_price, { endWith: 'DH' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                                                    <span className="text-[0.6rem] font-medium text-violet-500 uppercase tracking-wider">
                                                        Total × {reservation.duration}
                                                    </span>
                                                    <span className="text-sm font-medium text-violet-500">
                                                        {formatNumber(reservation.service_price * (reservation.duration || 0), { endWith: 'DH' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </section>
                        )}

                        {/* Section: Consommations */}
                        <section className="space-y-2">
                            <h3 className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <FileText size={11} className="opacity-60" />
                                Consommations
                            </h3>

                            <Card className="overflow-hidden p-0">

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="py-2.5 px-4 text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider">Désignation</th>
                                                <th className="py-2.5 px-4 text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider text-center">Qté</th>
                                                <th className="py-2.5 px-4 text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider text-right">Prix.U</th>
                                                <th className="py-2.5 px-4 text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">

                                            {/* Hébergement row */}
                                            <tr className="bg-muted/30">
                                                <td className="py-3.5 px-4">
                                                    <p className="text-sm font-medium text-foreground">Hébergement — {selectedAcc?.name}</p>
                                                    <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider mt-0.5">
                                                        Séjour de {reservation.duration} {Number(reservation.duration) > 1 ? 'nuits' : 'nuit'}
                                                    </p>
                                                </td>
                                                <td className="py-3.5 px-4 text-center text-sm font-medium text-muted-foreground">1</td>
                                                <td className="py-3.5 px-4 text-right text-sm font-medium text-foreground">{formatNumber(reservation.daily_price)}</td>
                                                <td className="py-3.5 px-4 text-right text-sm font-medium text-foreground">{formatNumber(reservation.total_price || 0, { endWith: 'DH' })}</td>
                                            </tr>

                                            {/* Order items */}
                                            {(reservation.orders || []).flatMap((order: any) =>
                                                (order.order_items || []).map((item: any) => (
                                                    <tr key={item.id}>
                                                        <td className="py-3.5 px-4 text-sm font-medium text-foreground">{item.product_name}</td>
                                                        <td className="py-3.5 px-4 text-center text-sm font-medium text-muted-foreground">×{item.quantity}</td>
                                                        <td className="py-3.5 px-4 text-right text-sm font-medium text-foreground">{formatNumber(item.price)}</td>
                                                        <td className="py-3.5 px-4 text-right text-sm font-medium text-foreground">{formatNumber(item.total || 0, { endWith: 'DH' })}</td>
                                                    </tr>
                                                ))
                                            )}

                                            {/* Empty state */}
                                            {reservation.orders?.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="py-10 text-center text-[0.6rem] font-medium text-muted-foreground uppercase tracking-widest">
                                                        Aucune consommation enregistrée
                                                    </td>
                                                </tr>
                                            )}

                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary */}
                                <div className="border-t border-border bg-muted/20 p-4 space-y-2.5">

                                    <div className="flex justify-between items-center">
                                        <span className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider">Sous-total hébergement</span>
                                        <span className="text-sm font-medium text-foreground">{formatNumber(housingTotal, { endWith: 'DH' })}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wider">Total consommations</span>
                                        <span className="text-sm font-medium text-foreground">{formatNumber(reservation.total_orders_amount || 0, { endWith: 'DH' })}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-[0.6rem] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Avance</span>
                                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                            − {formatNumber(reservation.advance_amount, { endWith: 'DH' })}
                                        </span>
                                    </div>

                                    {/* Total row */}
                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <div>
                                            <p className="text-xs font-medium text-foreground uppercase tracking-tight">Solde restant</p>
                                            <p className="text-[0.6rem] text-muted-foreground mt-0.5">
                                                Total brut : {formatNumber(invoiceTotal, { endWith: 'DH' })}
                                            </p>
                                        </div>
                                        <span className="text-2xl font-medium text-brand-600 tabular-nums">
                                            {formatNumber(reservation.amount_to_pay || 0, { endWith: 'DH' })}
                                        </span>
                                    </div>

                                </div>
                            </Card>
                        </section>
                    </div>

                    {/* Sidebar Controls */}
                    <div className="space-y-4 mt-4">
                        <button
                            onClick={() => setShowInvoice(true)}
                            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <Printer size={18} /> Imprimer Facture
                        </button>

                        {
                            reservation.deleted_at && reservation.deleted_note && (
                                <div className="p-6 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/30">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Trash2 size={12} /> Motif d'archivage
                                    </p>
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 italic">
                                        "{reservation.deleted_note}"
                                    </p>
                                </div>
                            )
                        }
                    </div>

                    {showInvoice && (
                        <ReservationInvoice
                            reservation={reservation}
                            open={showInvoice}
                            onOpenChange={setShowInvoice}
                        />
                    )}
                </div>
            </ScrollArea>
        </>
    );
}
