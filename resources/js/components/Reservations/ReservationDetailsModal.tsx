import { useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    X, Calendar, MapPin, Users, Globe, ShieldCheck,
    FileText, Phone, CheckCircle2,
    ChevronDown, ChevronUp, Printer, Info, Briefcase, Trash2,
    Plus,
    Moon,
    HandCoins
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDateDisplay } from '@/lib/format-date';
import type { Reservation } from '@/types';
import { GuestDocuments } from './GuestDocuments';
import { ReservationInvoice } from './ReservationInvoice';
import { StatusBadge } from './ReservationCard';
import { Card, CardContent } from '../ui/card';
import { formatNumber } from '@/lib/format-number';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: Reservation | null;
};

type VisitorFormData = {
    full_name: string;
    document_number: string;
    phone: string;
};

const initialVisitorData: VisitorFormData = {
    full_name: '',
    document_number: '',
    phone: '',
};

export default function ReservationDetailsModal({ open, onOpenChange, reservation }: Props) {
    const user = usePage().props.auth.user;

    const [isGuestsExpanded, setIsGuestsExpanded] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [showAddVisitor, setShowAddVisitor] = useState(false);

    const visitorForm = useForm<VisitorFormData>(initialVisitorData);

    const submitVisitor = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!reservation) return;

        visitorForm.post(ReservationController.storeVisitor(reservation.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                visitorForm.reset();
                visitorForm.clearErrors();
                setShowAddVisitor(false);
            },
        });
    };

    const selectedAcc = reservation?.accommodation;
    const selectedChannel = reservation?.channel;

    const housingTotal = reservation?.total_price || 0;
    const invoiceTotal = Number(reservation?.amount_to_pay || 0) + Number(reservation?.advance_amount || 0);

    // For commission display if needed
    const commissionRate = selectedChannel?.commission || 0;
    const commissionAmount = (housingTotal * commissionRate) / 100;

    if (!reservation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-0 p-0 shadow-2xl sm:max-w-4xl overflow-hidden bg-background">
                {/* Header */}
                <DialogHeader className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-dark-surface/30 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shrink-0" style={{ backgroundColor: selectedAcc?.color || '#3b82f6' }}>
                            {(reservation.main_visitor?.full_name || 'C').charAt(0)}
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <DialogTitle className="text-xl sm:text-2xl font-black dark:text-white tracking-tighter">
                                    {reservation.main_visitor?.full_name || 'Client Inconnu'}
                                </DialogTitle>
                                <StatusBadge status={reservation.status || 'PENDING'} />
                                {reservation.reported && (
                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <ShieldCheck size={10} /> Déclaré
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Scrollable Content */}
                <ScrollArea className="px-8 max-h-[60vh] overflow-y-auto">
                    <div className="p-2 space-y-3 pb-5">
                        {/* Main Content Area */}
                        <div className="space-y-4">
                            {/* Section: Détails du Séjour */}
                            <section className='space-y-2'>
                                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Info size={12} className="text-brand-500" />
                                    Détails du Séjour
                                </h3>

                                <Card>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-y-6 xs:grid-cols-2 md:flex md:flex-wrap lg:flex-nowrap md:items-center md:justify-between gap-4 lg:gap-0">

                                            {/* Hébergement */}
                                            <div className="flex items-center gap-3 md:flex-1">
                                                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0" style={{ color: selectedAcc?.color }}>
                                                    <MapPin size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[0.65rem] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Hébergement</p>
                                                    <p className="font-bold text-sm text-foreground truncate">{selectedAcc?.name}</p>
                                                </div>
                                            </div>

                                            {/* Période Prévue */}
                                            <div className="flex items-center gap-3 md:flex-1 lg:border-l lg:border-border lg:pl-6 ml-1">
                                                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-brand-500">
                                                    <Calendar size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[0.65rem] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Période Prévue</p>
                                                    <p className="font-bold text-sm text-foreground">
                                                        {formatDateDisplay(reservation.check_in)} → {formatDateDisplay(reservation.check_out)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Période Réelle (Conditional) */}
                                            {(reservation.real_check_in || reservation.real_check_out) && (
                                                <div className="flex items-center gap-3 md:flex-1 lg:border-l lg:border-border lg:pl-6">
                                                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-emerald-500">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[0.65rem] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Période Réelle</p>
                                                        <p className="font-bold text-sm text-foreground">
                                                            {reservation.real_check_in ? formatDateDisplay(reservation.real_check_in) : '—'} → {reservation.real_check_out ? formatDateDisplay(reservation.real_check_out) : '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Durée */}
                                            <div className="flex items-center gap-3 md:flex-1 lg:border-l lg:border-border lg:pl-6">
                                                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-brand-500">
                                                    <Moon size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[0.65rem] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Durée</p>
                                                    <p className="font-bold text-sm text-foreground">
                                                        {reservation.duration} {Number(reservation.duration) > 1 ? 'nuits' : 'nuit'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Voyageurs */}
                                            <div className="flex items-center gap-3 md:flex-1 lg:border-l lg:border-border lg:pl-6">
                                                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-brand-500">
                                                    <Users size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[0.65rem] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Voyageurs</p>
                                                    <p className="font-bold text-sm text-foreground">
                                                        {reservation.adults} Ad.{Number(reservation.children) > 0 && ` + ${reservation.children} Enf.`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>

                            {/* ADMIN ONLY: Détails Financiers */}
                            {user.is_admin && (
                                <section className="space-y-3">
                                    <h3 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <ShieldCheck size={12} /> Détails Financiers
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Distribution Section */}
                                        <div className="p-4 bg-blue-50/40 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/20">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Globe size={12} /> Distribution
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase">Canal</span>
                                                    <span className="text-xs font-black dark:text-white">{selectedChannel?.name || 'Direct'}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-blue-200/30">
                                                    <span className="text-[10px] font-black text-blue-700 uppercase">Commission ({formatNumber(commissionRate, { endWith: '%' })})</span>
                                                    <span className="text-xs font-black text-blue-700">
                                                        {formatNumber(commissionAmount, { endWith: 'DH' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Improved Services Section */}
                                        <div className="p-4 bg-purple-50/40 dark:bg-purple-900/10 rounded-2xl border border-purple-100/50 dark:border-purple-800/20">
                                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <HandCoins size={12} /> Frais de service
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase text-nowrap">Prix par nuit</span>
                                                    <span className="text-xs font-black dark:text-white">
                                                        {formatNumber(reservation.service_price, { endWith: 'DH' })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-purple-200/30">
                                                    <span className="text-[10px] font-black text-purple-700 uppercase">Total (<b className='lowercase'>x</b> {reservation.duration})</span>
                                                    <span className="text-xs font-black text-purple-700">
                                                        {formatNumber(reservation.service_price * (reservation.duration || 0), { endWith: 'DH' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Creator/Management Section */}
                                        <div className="p-4 bg-emerald-50/40 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/20">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Briefcase size={12} /> Gestion
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase">Par</span>
                                                    <span className="text-xs font-black dark:text-white truncate ml-2">{reservation.creator?.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase">Le</span>
                                                    <span className="text-xs font-black dark:text-white">
                                                        {reservation.created_at ? format(new Date(reservation.created_at), 'dd/MM/yyyy') : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Guest Profiles Section */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setIsGuestsExpanded(!isGuestsExpanded)}
                                        className="flex-1 flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                <Users size={20} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-sm font-black dark:text-white uppercase tracking-tight">Dossiers Visiteurs</h3>
                                                <p className="text-[0.625rem] font-bold text-gray-400 uppercase">{(reservation.visitors || []).length} Profils enregistrés</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-400 transition-transform duration-200 group-hover:scale-110">
                                            {isGuestsExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                        </div>
                                    </button>
                                    <Button
                                        onClick={() => { setShowAddVisitor(!showAddVisitor); setIsGuestsExpanded(true); }}
                                        className="ml-4 h-14 w-14 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white shadow-lg shrink-0"
                                    >
                                        <Plus size={24} />
                                    </Button>
                                </div>

                                {isGuestsExpanded && (
                                    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                        {showAddVisitor && (
                                            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-brand-500/20 space-y-4">
                                                <h4 className="text-sm font-black uppercase">Nouveau Voyageur</h4>
                                                <form onSubmit={submitVisitor} className="grid sm:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Nom complet</Label>
                                                        <Input
                                                            value={visitorForm.data.full_name}
                                                            onChange={(e) => visitorForm.setData('full_name', e.target.value)}
                                                            placeholder="Nom"
                                                        />
                                                        <InputError message={visitorForm.errors.full_name} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>N° Document</Label>
                                                        <Input
                                                            value={visitorForm.data.document_number}
                                                            onChange={(e) => visitorForm.setData('document_number', e.target.value)}
                                                            placeholder="ID / Passeport"
                                                        />
                                                        <InputError message={visitorForm.errors.document_number} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Téléphone</Label>
                                                        <Input
                                                            value={visitorForm.data.phone}
                                                            onChange={(e) => visitorForm.setData('phone', e.target.value)}
                                                            placeholder="+212 ..."
                                                        />
                                                        <InputError message={visitorForm.errors.phone} />
                                                    </div>
                                                    <div className="sm:col-span-3 flex justify-end gap-2">
                                                        <Button type="button" variant="ghost" onClick={() => setShowAddVisitor(false)}>Annuler</Button>
                                                        <Button type="submit" disabled={visitorForm.processing} className="bg-brand-500 text-white">Ajouter</Button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-6">
                                            {(reservation.visitors || []).map((guest, idx) => (
                                                <div
                                                    key={guest.id}
                                                    className={`p-6 sm:p-8 rounded-2xl border-2 transition-all space-y-6 ${guest.is_main
                                                        ? 'bg-brand-50/20 border-brand-500/20 dark:bg-brand-900/10 dark:border-brand-500/30'
                                                        : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800'
                                                        }`}
                                                >
                                                    {/* Guest Header */}
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-black shrink-0 ${guest.is_main
                                                                ? 'bg-brand-500 text-white shadow-md'
                                                                : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                                                                }`}>
                                                                {idx + 1}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h4 className="text-lg sm:text-xl font-black dark:text-white tracking-tight truncate">
                                                                        {guest.full_name}
                                                                    </h4>
                                                                    {guest.is_main && (
                                                                        <span className="bg-brand-500 text-white px-2 py-0.5 rounded-full text-[0.5rem] font-black uppercase tracking-wider whitespace-nowrap">
                                                                            Hôte principal
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {guest.phone && (
                                                                    <div className="flex items-center gap-2 mt-1 text-gray-400">
                                                                        <Phone size={12} />
                                                                        <span className="text-[0.625rem] font-bold uppercase tracking-wider">
                                                                            {guest.phone}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Documents Management */}
                                                    {guest.id && (
                                                        <GuestDocuments
                                                            guestId={guest.id}
                                                            guestName={guest.full_name}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Section: Consommations */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={12} className="text-brand-500" /> Consommations
                                </h3>

                                <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                                    {/* Table View */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-[0.625rem] font-black uppercase text-gray-400 tracking-widest">
                                                <tr>
                                                    <th className="py-3 px-2">Désignation</th>
                                                    <th className="py-3 px-2 text-center">Qté</th>
                                                    <th className="py-3 px-2 text-right">Prix.U</th>
                                                    <th className="py-3 px-2 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                <tr className="text-sm font-bold bg-gray-50/30 dark:bg-gray-900/30">
                                                    <td className="py-4 px-2">
                                                        <p className="font-black">Hébergement - {selectedAcc?.name}</p>
                                                        <p className="text-[8px] text-gray-400 uppercase">Séjour de {reservation.duration} {Number(reservation.duration) > 1 ? 'nuits' : 'nuit'}</p>
                                                    </td>
                                                    <td className="py-4 px-2 text-center">1</td>
                                                    <td className="py-4 px-2 text-right font-black">{formatNumber(reservation.daily_price)}</td>
                                                    <td className="py-4 px-2 text-right font-black">{formatNumber(reservation.total_price || 0, { endWith: 'DH' })}</td>
                                                </tr>
                                                {(reservation.orders || []).flatMap(order => (order.order_items || []).map(item => (
                                                    <tr key={item.id} className="text-sm font-bold dark:text-white">
                                                        <td className="py-4 px-2">{item.product_name}</td>
                                                        <td className="py-4 px-2 text-center">x{item.quantity}</td>
                                                        <td className="py-4 px-2 text-right font-black">{formatNumber(item.price)}</td>
                                                        <td className="py-4 px-2 text-right font-black">{formatNumber((item.total || 0), { endWith: 'DH' })}</td>
                                                    </tr>
                                                )))}

                                                {reservation.orders?.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="py-10 text-center text-gray-400 italic text-xs uppercase tracking-widest">Aucune consommation enregistrée</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary Breakdown */}
                                    <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                        <div className="flex justify-between items-center text-[0.625rem] font-black text-gray-400 uppercase tracking-widest">
                                            <span>Sous-total Hébergement</span>
                                            <span>{formatNumber(housingTotal, {
                                                endWith: 'DH',
                                            })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[0.625rem] font-black text-gray-400 uppercase tracking-widest">
                                            <span>Total Consommations</span>
                                            <span>{formatNumber(reservation.total_orders_amount || 0, {
                                                endWith: 'DH',
                                            })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[0.625rem] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                            <span>Avance</span>
                                            <span>- {formatNumber(reservation.advance_amount, {
                                                endWith: 'DH',
                                            })}</span>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                            <div>
                                                <span className="text-xs font-black dark:text-white uppercase tracking-tight">SOLDE RESTANT</span>
                                                <span className="block text-[0.625rem] font-medium text-gray-400 uppercase">
                                                    Total Brut: {formatNumber(invoiceTotal, {
                                                        endWith: 'DH',
                                                    })}
                                                </span>
                                            </div>
                                            <span className="text-xl sm:text-2xl font-black text-brand-600 tabular-nums">
                                                {formatNumber(reservation.amount_to_pay || 0, {
                                                    endWith: 'DH',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
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
                    </div>
                </ScrollArea>

                {showInvoice && (
                    <ReservationInvoice
                        reservation={reservation}
                        open={showInvoice}
                        onOpenChange={setShowInvoice}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
