import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reservation, Accommodation } from '@/types';

interface ReservationInvoiceProps {
    reservation: Reservation;
    type: 'full' | 'summary';
    accommodations: Accommodation[];
    formatCurrency: (value: number) => string;
    onClose: () => void;
}

export const ReservationInvoice: React.FC<ReservationInvoiceProps> = ({
    reservation,
    formatCurrency,
    onClose
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-card w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-black">Aperçu Facture</h3>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                            <Printer size={16} /> Imprimer
                        </Button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-12 bg-white text-black" id="printable-invoice">
                    {/* Simplified Invoice Content for placeholder */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Facture</h2>
                            <p className="text-gray-500">#{reservation.id.toString().padStart(6, '0')}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">Villa PMS</p>
                            <p className="text-sm text-gray-500">Marrakech, Maroc</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Client</p>
                        <p className="font-black text-lg">{reservation.main_visitor?.full_name}</p>
                    </div>

                    <table className="w-full mb-8">
                        <thead className="border-b-2 border-black">
                            <tr className="text-left text-xs font-black uppercase">
                                <th className="py-2">Description</th>
                                <th className="py-2 text-center">Quantité</th>
                                <th className="py-2 text-right">Prix</th>
                                <th className="py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-4">Hébergement ({reservation.accommodation?.name})</td>
                                <td className="py-4 text-center">{reservation.duration} nuits</td>
                                <td className="py-4 text-right">{formatCurrency(reservation.daily_price)}</td>
                                <td className="py-4 text-right font-bold">{formatCurrency(reservation.total_price || 0)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-end pt-4 border-t-2 border-black">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>{formatCurrency((reservation.total_price || 0) + (reservation.service_price || 0))}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                                <span>Avance</span>
                                <span>- {formatCurrency(reservation.advance_amount)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black border-t pt-2">
                                <span>Solde</span>
                                <span>{formatCurrency(reservation.amount_to_pay || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
