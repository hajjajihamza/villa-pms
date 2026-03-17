import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { addDays, subDays, startOfWeek, endOfWeek, format, eachDayOfInterval, isSameDay, parseISO, differenceInDays, max as maxDate, min as minDate, isAfter, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ReservationDetailsModal from '@/components/Reservations/ReservationDetailsModal';
import ReservationForm from '@/components/Reservations/ReservationForm';
import type { Accommodation, Channel, Reservation, Unit } from '@/types';
import PlanningController from '@/actions/App/Http/Controllers/Reservation/PlanningController';
import { formatNumber } from '@/lib/format-number';

type PlanningUnit = {
    id: number;
    name: string;
    accommodations: Accommodation[];
    reservations: Reservation[];
};

type Props = {
    date: string;
    units: PlanningUnit[];
    channels: Channel[];
    accommodations: Accommodation[];
    unitsData: Unit[];
};

export default function PlanningIndex({ date, units, channels, accommodations, unitsData }: Props) {
    const currentDate = parseISO(date);
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [defaultDate, setDefaultDate] = useState<string | null>(null);

    const navigateToDate = (newDate: Date) => {
        router.get(PlanningController.index().url, { date: format(newDate, 'yyyy-MM-dd') }, { preserveState: true, preserveScroll: true });
    };

    const handlePreviousWeek = () => navigateToDate(subDays(currentDate, 7));
    const handleNextWeek = () => navigateToDate(addDays(currentDate, 7));
    const handleToday = () => navigateToDate(new Date());

    const openReservationDetails = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setIsDetailsModalOpen(true);
    };

    const openEmptySlot = (day: Date) => {
        setDefaultDate(format(day, 'yyyy-MM-dd'));
        setIsFormOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Planning" />

            <div className="flex h-full flex-col gap-4 w-full max-w-full">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Planning</h1>
                        <p className="text-sm text-muted-foreground">Gestion des réservations</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleToday}>
                            Aujourd'hui
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNextWeek}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <div className="px-4 py-2 text-sm font-bold bg-muted rounded-md border text-center min-w-[200px]">
                            {format(startDate, 'dd MMM', { locale: fr })} - {format(endDate, 'dd MMM yyyy', { locale: fr })}
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <Card className="flex-1 border-0 shadow-sm bg-white dark:bg-dark-surface/50 overflow-hidden flex flex-col py-0">
                    <div className="flex-1 overflow-auto rounded-lg border">
                        <div className="min-w-[800px] w-full grid" style={{ gridTemplateColumns: '150px repeat(7, minmax(100px, 1fr))' }}>
                            {/* Header Row */}
                            <div className="sticky top-0 left-0 z-20 bg-gray-100 dark:bg-gray-800 border-b border-r px-4 py-3 font-bold text-xs uppercase tracking-widest flex items-center shadow-sm">
                                Unité
                            </div>
                            {days.map((day, idx) => (
                                <div key={idx} className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/80 border-b border-r px-2 py-3 text-center shadow-sm">
                                    <div className="text-[10px] font-black uppercase text-gray-500">{format(day, 'EEEE', { locale: fr })}</div>
                                    <div className={`text-lg font-black ${isSameDay(day, new Date()) ? 'text-brand-500' : 'text-foreground'}`}>
                                        {format(day, 'dd')}
                                    </div>
                                </div>
                            ))}

                            {/* Unit Rows */}
                            {units.map((unit) => (
                                <div className="contents group" key={unit.id}>
                                    {/* Unit Name Column (Sticky) */}
                                    <div className="sticky left-0 z-20 bg-white dark:bg-gray-900 border-b border-r px-4 py-8 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] flex items-center break-words group-hover:bg-gray-50 dark:group-hover:bg-gray-800/80 transition-colors">
                                        {unit.name}
                                    </div>

                                    {/* Continuous Days View for the Unit */}
                                    <div className="relative col-span-7 grid grid-cols-7 border-b min-h-[100px]">
                                        {/* Background Grid Cells */}
                                        {days.map((day, idx) => {
                                            const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`border-r h-full transition-colors ${
                                                        isPast 
                                                        ? 'bg-gray-50/50 dark:bg-gray-900/30 cursor-not-allowed' 
                                                        : 'bg-white dark:bg-gray-900 cursor-pointer hover:bg-brand-50/30 dark:hover:bg-brand-900/10'
                                                    }`}
                                                    onClick={() => {
                                                        if (!isPast) {
                                                            openEmptySlot(day);
                                                        }
                                                    }}
                                                />
                                            );
                                        })}

                                        {/* Reservation Blocks */}
                                        {unit.reservations.map((res) => {
                                            const resStart = parseISO(res.check_in as unknown as string);
                                            const resEnd = parseISO(res.check_out as unknown as string);
                                            
                                            // Check if reservation overlaps with current week
                                            const overlaps = (
                                                (resStart <= endDate && resEnd >= startDate)
                                            );

                                            if (!overlaps) return null;

                                            const color = res.accommodation?.color || '#3b82f6';
                                            
                                            // Calculate position
                                            const actualDisplayStart = maxDate([resStart, startDate]);
                                            const actualDisplayEnd = minDate([resEnd, endDate]);
                                            
                                            const startOffset = differenceInDays(actualDisplayStart, startDate);
                                            const endOffset = differenceInDays(actualDisplayEnd, startDate);
                                            
                                            const isStartedBefore = isBefore(resStart, startDate);
                                            const isEndsAfter = isAfter(resEnd, endDate);

                                            // Width and Left calculation:
                                            // 1 day = 1/7 of width (14.28%)
                                            // Gap Logic: 
                                            // Check-out day: ends at 45% of the cell
                                            // Check-in day: starts at 55% of the cell
                                            
                                            // 1. Calculate base left position
                                            const dayWidth = 100 / 7;
                                            let leftPercent = startOffset * dayWidth;
                                            
                                            // 2. Adjust left if it's the check-in day (and not before the week)
                                            if (!isStartedBefore) {
                                                leftPercent += dayWidth * 0.55; // Start at 55% of the first day
                                            }

                                            // 3. Calculate width
                                            let widthPercent;
                                            if (isEndsAfter) {
                                                // Ends after this week: cover remaining days full
                                                // If it started this week, it covers from 55% of start day to end of week
                                                // If it started before, it covers 0% to end of week
                                                widthPercent = (7 - startOffset) * dayWidth;
                                                if (!isStartedBefore) {
                                                    widthPercent -= dayWidth * 0.55;
                                                }
                                            } else {
                                                // Ends this week on endOffset day.
                                                // It covers from its start (leftPercent) to 45% of the endOffset day.
                                                const absoluteEndPercent = (endOffset * dayWidth) + (dayWidth * 0.45);
                                                widthPercent = absoluteEndPercent - leftPercent;
                                            }

                                            return (
                                                <div
                                                    key={res.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openReservationDetails(res);
                                                    }}
                                                    className="absolute top-3 bottom-3 z-10 rounded-md cursor-pointer transition-all hover:scale-[1.01] hover:z-20 group/res"
                                                    style={{
                                                        left: `${leftPercent}%`,
                                                        width: `${widthPercent}%`,
                                                        backgroundColor: `${color}15`, // 15% opacity background
                                                        borderLeft: `4px solid ${color}`,
                                                        boxShadow: `0 2px 4px -1px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.06)`
                                                    }}
                                                >
                                                    <div className="flex flex-col h-full px-3 justify-center overflow-hidden border border-l-0 rounded-r-md" style={{ borderColor: `${color}30` }}>
                                                        <div className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                                                            {res.main_visitor?.full_name || 'Inconnu'}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[9px] font-black uppercase tracking-wider opacity-70" style={{ color }}>
                                                                {res.accommodation?.name}
                                                            </span>
                                                            <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-gray-400 text-nowrap">
                                                                {formatNumber(res.amount_to_pay || 0, {endWith: 'DH'})}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Tooltip-like effect on hover */}
                                                    <div className="absolute inset-0 bg-white/10 dark:bg-black/10 opacity-0 group-hover/res:opacity-100 transition-opacity rounded-r-md" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {units.length === 0 && (
                            <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest">
                                Aucune unité disponible.
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Modals */}
            <ReservationDetailsModal
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
                reservation={selectedReservation}
            />

            <ReservationForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                channels={channels}
                accommodations={accommodations}
                units={unitsData}
                defaultDate={defaultDate}
            />
        </AppLayout>
    );
}
