import { Head, Link } from '@inertiajs/react';
import { Archive, Bed, CalendarCheck, CalendarClock, List, Plus } from 'lucide-react';
import { useState } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import ReservationFilters from '@/components/Reservations/ReservationFilters';
import ReservationForm from '@/components/Reservations/ReservationForm';
import ReservationList from '@/components/Reservations/ReservationList/ReservationList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type {
    Accommodation,
    BreadcrumbItem,
    Paginated,
    Reservation,
} from '@/types';

export type PaginatedReservations = Paginated & {
    data: Reservation[];
};

type Props = {
    reservations: PaginatedReservations;
    accommodations: Accommodation[];
    activeTab: string;
};

const TABS = [
    { label: 'Arrivées', id: 'arrivals', href: ReservationController.index().url, icon: CalendarCheck },
    { label: 'Départs', id: 'departures', href: ReservationController.departures().url, icon: CalendarClock },
    { label: 'Séjours en cours', id: 'stay-overs', href: ReservationController.stayOvers().url, icon: Bed },
    { label: 'Archive', id: 'archive', href: ReservationController.archive().url, icon: Archive },
    { label: 'Toutes', id: 'all', href: ReservationController.all().url, icon: List },
];

export default function ReservationIndex({ reservations, accommodations, activeTab }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Reservations',
            href: ReservationController.index(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservations" />

            <section className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Reservations</h1>
                        <p className="text-sm text-muted-foreground">
                            Gerez les sejours, la validation et les visiteurs
                            supplementaires.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                setEditingReservation(null);
                                setFormOpen(true);
                            }}
                        >
                            <Plus className="mr-2 size-4" />
                            Nouvelle reservation
                        </Button>
                    </div>
                </div>

                <ReservationFilters accommodations={accommodations} />

                <div className="scrollbar-hide flex overflow-x-auto border-b border-border">
                    {TABS.map((tab) => (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground'
                            }`}
                        >
                            <tab.icon className="size-4" />
                            {tab.label}
                        </Link>
                    ))}
                </div>

                <ReservationList
                    reservations={reservations}
                    onEdit={(reservation) => {
                        setEditingReservation(reservation);
                        setFormOpen(true);
                    }}
                />

                <ReservationForm
                    open={formOpen}
                    onOpenChange={(open) => {
                        setFormOpen(open);
                        if (!open) {
                            setEditingReservation(null);
                        }
                    }}
                    reservation={editingReservation}
                />
            </section>
        </AppLayout>
    );
}
