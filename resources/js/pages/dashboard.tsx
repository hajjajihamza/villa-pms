import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Suspense, useState } from 'react';
import { StatCards } from '@/components/dashboard/stat-cards';
import { ReservationVolume } from '@/components/dashboard/reservation-volume';
import { format } from 'date-fns';
import { CalendarIcon, LayoutGrid } from 'lucide-react';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '@/types/dashboard';
import { getDashboardStatistics } from '@/api/statistics';
import { MonthPicker } from '@/components/ui/monthpicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fr } from 'date-fns/locale';

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function Dashboard() {
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
            action={
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !selectedMonth && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedMonth ? format(selectedMonth, "MMM yyyy", {locale: fr}) : <span>Pick a month</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <MonthPicker onMonthSelect={setSelectedMonth} selectedMonth={selectedMonth}/>
                    </PopoverContent>
                </Popover>
            }
        >
            <Head title="Tableau de bord" />

            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent month={format(selectedMonth, 'yyyy-MM')} />
            </Suspense>
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
                <div className="flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-indigo-500" />
                    <CardTitle className="text-lg">Analyse des Canaux</CardTitle>
                </div>
                <CardDescription className="mb-4">Performance détaillée : Volume et Revenu par source</CardDescription>

                <ReservationVolume stats={stats} />
            </div>
        </div>
    );
}