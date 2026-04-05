import { useState, useMemo } from 'react';
import type { Reservation } from '@/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Clock, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDateDisplay } from '@/lib/format-date';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type ReservationTabsProps = {
    reservations?: Reservation[];
    selectedReservationId: string | null;
    onSelectReservation: (id: string | null) => void;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function ReservationTabs({ reservations, selectedReservationId, onSelectReservation }: ReservationTabsProps) {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const filteredReservations = useMemo(() => {
        if (!reservations) return [];
        if (!searchQuery.trim()) return reservations;

        const query = searchQuery.toLowerCase();
        return reservations.filter(res => {
            const name = res.main_visitor?.full_name?.toLowerCase() || '';
            const accName = res.accommodation?.name?.toLowerCase() || '';
            return name.includes(query) || accName.includes(query);
        });
    }, [reservations, searchQuery]);

    if (!reservations || reservations.length === 0) {
        return null;
    }

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <div className="flex flex-row items-center gap-2 w-full pt-1 px-1 border-b border-gray-200 pb-2">
            <div className="relative shrink-0 w-[140px] sm:w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 py-2.5 h-auto bg-gray-100 hover:bg-gray-200/60 dark:bg-dark-surface dark:hover:bg-dark-surface/80 border-transparent rounded-xl text-xs sm:text-sm font-medium focus-visible:ring-1 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 w-full transition-all shadow-sm"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors bg-gray-200/80 dark:bg-white/10 rounded-full p-0.5"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            <ScrollArea className="flex-1 whitespace-nowrap min-w-0">
                <div className="flex w-max space-x-2 p-1">
                    {filteredReservations.map((res) => {
                        const isSelected = selectedReservationId === res.id.toString();
                        const label = res.main_visitor?.full_name || `Réservation #${res.id}`;
                        const sublabel = formatDateDisplay(res.check_in) + ' - ' + formatDateDisplay(res.check_out);

                        return (
                            <button
                                key={res.id}
                                onClick={() => onSelectReservation(isSelected ? null : res.id.toString())}
                                className={`flex flex-col items-start justify-center rounded-xl px-4 py-2 text-left transition-all border min-w-[140px] max-w-[200px] ${
                                    isSelected
                                        ? 'bg-black text-white shadow-md border-black dark:bg-white dark:text-black dark:border-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200 dark:bg-dark-card dark:text-gray-300 dark:border-white/10 dark:hover:bg-dark-surface'
                                }`}
                            >
                                <span className={`font-bold text-sm truncate w-full flex items-center gap-2 shrink-0 ${isSelected ? 'text-white dark:text-black' : ''}`}>
                                    {res.status === 'PENDING' && <Clock className="w-3 h-3 text-orange-500" />}
                                    {label}
                                </span>
                                {sublabel && (
                                    <span className={`text-xs truncate w-full mt-1 ${isSelected ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {sublabel}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                    {filteredReservations.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500 italic">
                            Aucune réservation trouvée
                        </div>
                    )}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};
