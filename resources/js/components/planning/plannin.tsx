import { router, usePage } from '@inertiajs/react';
import { addDays, format, parseISO, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import PlanningGantt from '@/components/planning/planning-gantt';
import ReservationForm from '@/components/Reservations/forms/reservation-form';
import ReservationModal from '@/components/Reservations/info/reservation-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Reservation } from '@/types';
import IcalController from '@/actions/App/Http/Controllers/Ical/IcalController';
import PlanningController from '@/actions/App/Http/Controllers/Reservation/PlanningController';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
export type PlanningUnit = {
    id: number;
    name: string;
    color: string;
    reservations: Reservation[];
};

export type Props = {
    date: string;
    view: 'week' | 'month';
    data: PlanningUnit[];
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function Planning({ date, view, data, className }: Props & { className?: string }) {
    // ────────────────────────────────────────────────
    // Props
    // ────────────────────────────────────────────────
    const user = usePage().props.auth.user;

    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const currentDate = parseISO(date);
    const displayStart = currentDate;
    const displayEnd = addDays(currentDate, view === 'month' ? 30 : 7);

    const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [defaultDate, setDefaultDate] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const navigateToDate = (newDate: Date, newView?: string) => {
        router.get(
            PlanningController.index().url,
            {
                date: format(newDate, 'yyyy-MM-dd'),
                view: newView || view,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePrevious = () => {
        navigateToDate(subDays(displayStart, view === 'month' ? 30 : 7));
    };

    const handleNext = () => {
        navigateToDate(addDays(displayStart, view === 'month' ? 30 : 7));
    };

    const handleToday = () => navigateToDate(new Date());

    const toggleView = (newView: 'week' | 'month') => {
        navigateToDate(currentDate, newView);
    };

    const openReservationDetails = (id: number) => {
        setSelectedReservationId(id);
    };

    const openEmptySlot = (day: Date) => {
        setDefaultDate(format(day, 'yyyy-MM-dd'));
        setIsFormOpen(true);
    };

    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────
    return (
        <div className={className}>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-indigo-500" />
                        <h1 className="text-lg font-semibold">Planning</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Planning des réservations
                    </p>
                </div>

                <div className="flex flex-1 flex-col justify-end gap-4 md:flex-row md:items-center">
                    {/* refresh button */}
                    {user.is_admin && (
                        <Button
                            variant="outline-info"
                            onClick={() =>
                                router.get(
                                    IcalController.sync().url,
                                    {},
                                    {
                                        onStart: () => setIsSyncing(true),
                                        onFinish: () => setIsSyncing(false),
                                    },
                                )
                            }
                            disabled={isSyncing}
                        >
                            {isSyncing ? (
                                <RefreshCcw className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCcw className="h-4 w-4" />
                            )}
                            {isSyncing ? 'Actualisation...' : 'Actualiser'}
                        </Button>
                    )}

                    <div className="flex w-full items-center rounded-lg border bg-muted p-1 shadow-sm md:w-fit">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 flex-1 px-4 text-xs font-medium transition-all md:flex-none ${
                                view === 'week'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => toggleView('week')}
                        >
                            Semaine
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 flex-1 px-4 text-xs font-medium transition-all md:flex-none ${
                                view === 'month'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => toggleView('month')}
                        >
                            Mois
                        </Button>
                    </div>

                    <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0"
                                onClick={handlePrevious}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 text-xs"
                                onClick={handleToday}
                            >
                                Aujourd&apos;hui
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0"
                                onClick={handleNext}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="min-w-[180px] flex-1 rounded-md border bg-muted px-4 py-2 text-center text-sm font-bold whitespace-nowrap md:min-w-[200px] md:flex-none">
                            {view === 'month'
                                ? format(currentDate, 'MMMM yyyy', {
                                      locale: fr,
                                  })
                                : `${format(displayStart, 'dd MMM', { locale: fr })} - ${format(displayEnd, 'dd MMM yyyy', { locale: fr })}`}
                        </div>
                    </div>
                </div>
            </div>

            {/* calendar */}
            <Card className="flex flex-1 flex-col overflow-hidden border-0 bg-white py-0 shadow-sm dark:bg-dark-surface/50">
                {data.length === 0 ? (
                    <div className="flex-1 p-8 text-center font-bold tracking-widest text-gray-500 uppercase">
                        Aucune Hébergement disponible.
                    </div>
                ) : (
                    <PlanningGantt
                        displayStart={displayStart}
                        displayEnd={displayEnd}
                        view={view}
                        units={data}
                        onReservationSelect={openReservationDetails}
                        onDateSelect={openEmptySlot}
                    />
                )}
            </Card>

            {/* modal */}
            <ReservationModal
                open={!!selectedReservationId}
                onOpenChange={(open) => !open && setSelectedReservationId(null)}
                reservationId={selectedReservationId as number}
            />

            {/* form */}
            <ReservationForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                defaultDate={defaultDate}
            />
        </div>
    );
}
