import React, { useRef } from 'react';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Reservation } from '@/types';
import { formatNumber } from '@/lib/format-number';
import Logo from '../logo';
import { formatDateDisplay } from '@/lib/format-date';

interface ReservationInvoiceProps {
    reservation: Reservation;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ReservationInvoice: React.FC<ReservationInvoiceProps> = ({
    reservation,
    open,
    onOpenChange
}) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `#Fact-${reservation.id}`,
    });
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-0 p-0 shadow-2xl sm:max-w-4xl overflow-hidden bg-background">
                <DialogHeader className="p-6 border-b flex flex-row justify-between items-center shrink-0">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight">
                        Aperçu Facture
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="px-8 max-h-[60vh] overflow-y-auto">
                    <div className="bg-white text-black font-sans p-2 sm:p-4 print:p-0" id="printable-facture" ref={componentRef}>
                        {/* Header */}
                        <div className="text-center space-y-3">
                            <div className="flex justify-center">
                                <Logo size="xl" showText={true} />
                            </div>
                        </div>

                        {/* Info Client & Réservation */}
                        <div className="grid grid-cols-2 gap-10 mb-12 pb-6 border-b-2 border-black">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</p>
                                <p className="text-sm font-black uppercase">{reservation.main_visitor?.full_name}</p>
                                {reservation.main_visitor?.phone && <p className="text-[10px] font-bold text-gray-600">+{reservation.main_visitor.phone}</p>}
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Référence</p>
                                <p className="text-sm font-black">#RES-{reservation.id}</p>
                                <p className="text-[10px] font-bold text-gray-600">Unité : {reservation.accommodation?.name}</p>
                                <p className="text-[10px] font-bold text-gray-600">Séjour : {formatDateDisplay(reservation.check_in)} au {formatDateDisplay(reservation.check_out)}</p>
                            </div>
                        </div>

                        {/* Tableau des prestations */}
                        <table className="w-full text-left mb-10">
                            <thead>
                                <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-widest">
                                    <th className="py-3">Désignation</th>
                                    <th className="py-3 text-center">Qté</th>
                                    <th className="py-3 text-right">Prix.U</th>
                                    <th className="py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="text-xs font-bold bg-gray-50">
                                    <td className="py-4">
                                        <p className="font-black">Hébergement ({reservation.accommodation?.name})</p>
                                        <p className="text-[8px] text-gray-400 uppercase">Séjour de {reservation.duration} {Number(reservation.duration) > 1 ? 'nuits' : 'nuit'}</p>
                                    </td>
                                    <td className="py-4 text-center">1</td>
                                    <td className="py-4 text-right">{formatNumber(reservation.daily_price || 0)}</td>
                                    <td className="py-4 text-right">{formatNumber(reservation.total_price || 0, { endWith: 'DH' })}</td>
                                </tr>

                                {(reservation.orders || []).flatMap(order => (order.order_items || []).map(item => (
                                    <tr key={item.id} className="text-xs">
                                        <td className="py-4">
                                            <p className="font-black uppercase text-sm">{item.product_name}</p>
                                        </td>
                                        <td className="py-4 text-center">x{item.quantity}</td>
                                        <td className="py-4 text-right">{formatNumber(item.price)}</td>
                                        <td className="py-4 text-right font-black">{formatNumber((item.total || 0), { endWith: 'DH' })}</td>
                                    </tr>
                                )))}

                                {reservation.orders?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-gray-400 italic text-xs uppercase tracking-widest">Aucune consommation enregistrée</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Résumé des Totaux */}
                        <div className="flex justify-end pt-6 border-t-4 border-black">
                            <div className="w-72 space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 tracking-widest">
                                    <span>Sous-total Hébergement</span>
                                    <span>{formatNumber((reservation.total_price || 0), { endWith: 'DH' })}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 tracking-widest">
                                    <span>Total Consommations</span>
                                    <span>{formatNumber((reservation.total_orders_amount || 0), { endWith: 'DH' })}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black text-emerald-600 tracking-widest">
                                    <span>Avance</span>
                                    <span>- {formatNumber((reservation.advance_amount || 0), { endWith: 'DH' })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-gray-500 tracking-widest">
                                    <span>Total Brut</span>
                                    <span className="text-black font-black">{formatNumber((reservation.total_price || 0) + (reservation.total_orders_amount || 0), { endWith: 'DH' })}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-black tracking-tighter">
                                        Solde Restant
                                    </span>
                                    <span className="text-2xl font-black tabular-nums">
                                        {formatNumber((reservation.amount_to_pay || 0), { endWith: 'DH' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-10 pt-10 border-t border-gray-100 text-center">
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300">
                                Merci de votre confiance • Villa Mouloud Luxury Stays • Marrakech
                            </p>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 border-t bg-gray-50/50 dark:bg-dark-surface/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-12 rounded-xl font-bold uppercase tracking-widest text-xs border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handlePrint}
                            className="h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Printer size={16} /> Imprimer Facture
                        </Button>
                    </div>
                </DialogFooter>

                {/* Print styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { margin: 2rem; }
                        body * { visibility: hidden; }
                        #printable-facture, #printable-facture * { visibility: visible; }
                        #printable-facture { position: absolute; left: 0; top: 0; width: 100%; }
                        .radix-dialog-content { border: none !important; box-shadow: none !important; }
                    }
                `}} />
            </DialogContent>
        </Dialog>
    );
};
