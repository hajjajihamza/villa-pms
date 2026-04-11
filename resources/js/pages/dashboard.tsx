import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Suspense, useState } from 'react';
import { StatCards } from '@/components/dashboard/stat-cards';
import { ReservationVolume } from '@/components/dashboard/reservation-volume';
import { format } from 'date-fns';
import { CalendarIcon, LayoutGrid } from 'lucide-react';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '@/types/dashboard';
import { getDashboardStatistics } from '@/api/statistics';
import { MonthPicker } from '@/components/ui/monthpicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fr } from 'date-fns/locale';
import Planning, { Props as PlanningProps } from '@/components/planning/plannin';
import DashboardController from '@/actions/App/Http/Controllers/Dashboard/DashboardController';
import { BreadcrumbItem } from '@/types';

// ────────────────────────────────────────────────
//  Constants
// ────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: DashboardController.index(),
    },
];

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function Dashboard({ date, view, data }: PlanningProps) {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <AppLayout
            title="Tableau de bord"
            description="Aperçu des performances de votre établissement."
            breadcrumbs={breadcrumbs}
            action={
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !selectedMonth && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedMonth ? format(selectedMonth, "MMM yyyy", { locale: fr }) : <span>Pick a month</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <MonthPicker onMonthSelect={setSelectedMonth} selectedMonth={selectedMonth} />
                    </PopoverContent>
                </Popover>
            }
        >
            <Head title="Tableau de bord" />

            {/* Stats */}
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent month={format(selectedMonth, 'yyyy-MM')} />
            </Suspense>

            {/* Planning */}
            <Planning
                date={date}
                view={view}
                data={data}
                className="mt-8"
            />
        </AppLayout>
    );
}

// ────────────────────────────────────────────────
//  Sub component
// ────────────────────────────────────────────────
function DashboardContent({ month }: { month: string }) {
    // ────────────────────────────────────────────────
    //  Query
    // ────────────────────────────────────────────────
    const { data: stats } = useQuery<DashboardStats>({
        queryKey: ['dashboard-statistics', month],
        queryFn: () => getDashboardStatistics(month),
        suspense: true,
    });

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    if (!stats) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Row 1: General Stats */}
            <StatCards stats={stats} />

            {/* Row 2: Consolidated Channel Analysis */}
            <div>
                <div className='mb-2'>
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-indigo-500" />
                        <h1 className="text-lg font-semibold">
                            Analyse des Canaux
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Performance détaillée : Volume et Revenu par source
                    </p>
                </div>

                <ReservationVolume stats={stats} />
            </div>
        </div>
    );
}