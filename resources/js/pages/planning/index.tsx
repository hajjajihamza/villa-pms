import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Planning, { Props as PlanningProps } from '@/components/planning/plannin';
import { BreadcrumbItem } from '@/types';
import PlanningController from '@/actions/App/Http/Controllers/Reservation/PlanningController';

// ────────────────────────────────────────────────
//  Constants
// ────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Planning',
        href: PlanningController.index(),
    },
];

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function PlanningIndex({ date, view, data }: PlanningProps) {
    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────
    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title="Planning" />

            {/* planning */}
            <Planning
                date={date}
                view={view}
                data={data}
            />
        </AppLayout>
    );
}
