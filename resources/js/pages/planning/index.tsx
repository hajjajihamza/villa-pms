import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { addDays, subDays, startOfWeek, endOfWeek, format, eachDayOfInterval, isSameDay, parseISO, differenceInDays, max as maxDate, min as minDate, isAfter, isBefore, startOfDay, startOfMonth, endOfMonth } from 'date-fns';
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
    view: 'week' | 'month';
    units: PlanningUnit[];
    channels: Channel[];
    accommodations: Accommodation[];
    unitsData: Unit[];
};

export default function PlanningIndex({ date, view, units, channels, accommodations, unitsData }: Props) {
    const currentDate = parseISO(date);
    
    // Determine start and end date based on view mode
    const startDate = view === 'month' 
        ? startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }) 
        : startOfWeek(currentDate, { weekStartsOn: 1 });
    
    // For month view, we might want to show the whole month or just the weeks that contain the month.
    // The requirement says "see an entire month at a glance". 
    // Usually that means from the first day of the month to the last.
    // But to "integrate week features", showing full weeks that contain the month is often better.
    // Let's stick to the actual month days for now to be precise, or full weeks if it looks better.
    // Let's use the actual month range for "Month View" to avoid confusion.
    const displayStart = view === 'month' ? startOfMonth(currentDate) : startOfWeek(currentDate, { weekStartsOn: 1 });
    const displayEnd = view === 'month' ? endOfMonth(currentDate) : endOfWeek(currentDate, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: displayStart, end: displayEnd });

    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [defaultDate, setDefaultDate] = useState<string | null>(null);

    const navigateToDate = (newDate: Date, newView?: string) => {
        router.get(PlanningController.index().url, 
            { 
                date: format(newDate, 'yyyy-MM-dd'),
                view: newView || view
            }, 
            { preserveState: true, preserveScroll: true }
        );
    };

    const handlePrevious = () => {
        if (view === 'month') {
            navigateToDate(subDays(displayStart, 1));
        } else {
            navigateToDate(subDays(currentDate, 7));
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            navigateToDate(addDays(displayEnd, 1));
        } else {
            navigateToDate(addDays(currentDate, 7));
        }
    };

    const handleToday = () => navigateToDate(new Date());

    const toggleView = (newView: 'week' | 'month') => {
        navigateToDate(currentDate, newView);
    };

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
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-muted p-1 rounded-lg border">
                            <Button 
                                variant={view === 'week' ? 'secondary' : 'ghost'} 
                                size="sm" 
                                className="h-8 px-3 text-xs"
                                onClick={() => toggleView('week')}
                            >
                                Semaine
                            </Button>
                            <Button 
                                variant={view === 'month' ? 'secondary' : 'ghost'} 
                                size="sm" 
                                className="h-8 px-3 text-xs"
                                onClick={() => toggleView('month')}
                            >
                                Mois
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrevious}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleToday}>
                                Aujourd'hui
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleNext}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <div className="px-4 py-2 text-sm font-bold bg-muted rounded-md border text-center min-w-[200px]">
                                {view === 'month' 
                                    ? format(currentDate, 'MMMM yyyy', { locale: fr })
                                    : `${format(displayStart, 'dd MMM', { locale: fr })} - ${format(displayEnd, 'dd MMM yyyy', { locale: fr })}`
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <Card className="flex-1 border-0 shadow-sm bg-white dark:bg-dark-surface/50 overflow-hidden flex flex-col py-0">
                    <div className="flex-1 overflow-auto rounded-lg border">
                        <div 
                            className="min-w-fit w-full grid" 
                            style={{ gridTemplateColumns: `150px repeat(${days.length}, minmax(${view === 'month' ? '60px' : '100px'}, 1fr))` }}
                        >
                            {/* Header Row */}
                            <div className="sticky top-0 left-0 z-30 bg-gray-100 dark:bg-gray-800 border-b border-r px-4 py-3 font-bold text-xs uppercase tracking-widest flex items-center shadow-sm">
                                Unité
                            </div>
                            {days.map((day, idx) => (
                                <div key={idx} className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/80 border-b border-r px-1 py-2 text-center shadow-sm flex flex-col justify-center">
                                    <div className="text-[9px] font-black uppercase text-gray-500">{format(day, 'EEE', { locale: fr })}</div>
                                    <div className={`text-sm font-black ${isSameDay(day, new Date()) ? 'text-brand-500' : 'text-foreground'}`}>
                                        {format(day, 'dd')}
                                    </div>
                                    {view === 'month' && (format(day, 'i') === '1' || idx === 0) && (
                                        <div className="absolute -top-1 left-0 right-0 text-[8px] font-bold text-brand-600 bg-brand-50 border-b border-brand-100 py-0.5">
                                            S{format(day, 'ww')}
                                        </div>
                                    )}
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
                                    <div className={`relative grid border-b min-h-[100px]`} style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)`, gridColumn: `span ${days.length}` }}>
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
                                            
                                            // Check if reservation overlaps with current range
                                            const overlaps = (
                                                (resStart <= displayEnd && resEnd >= displayStart)
                                            );

                                            if (!overlaps) return null;

                                            const color = res.accommodation?.color || '#3b82f6';
                                            
                                            // Calculate position
                                            const actualDisplayStart = maxDate([resStart, displayStart]);
                                            const actualDisplayEnd = minDate([resEnd, displayEnd]);
                                            
                                            const startOffset = differenceInDays(actualDisplayStart, displayStart);
                                            const endOffset = differenceInDays(actualDisplayEnd, displayStart);
                                            
                                            const isStartedBefore = isBefore(resStart, displayStart);
                                            const isEndsAfter = isAfter(resEnd, displayEnd);

                                            // Width and Left calculation:
                                            // 1 day = 1/days.length of width
                                            
                                            // 1. Calculate base left position
                                            const dayWidth = 100 / days.length;
                                            let leftPercent = startOffset * dayWidth;
                                            
                                            // 2. Adjust left if it's the check-in day (and not before the range)
                                            if (!isStartedBefore) {
                                                leftPercent += dayWidth * 0.55; // Start at 55% of the first day
                                            }

                                            // 3. Calculate width
                                            let widthPercent;
                                            if (isEndsAfter) {
                                                // Ends after this range
                                                widthPercent = (days.length - startOffset) * dayWidth;
                                                if (!isStartedBefore) {
                                                    widthPercent -= dayWidth * 0.55;
                                                }
                                            } else {
                                                // Ends this range on endOffset day.
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
