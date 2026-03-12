import { Head, Link } from '@inertiajs/react';
import { Archive, Bed, CalendarCheck, CalendarClock, Clock, LayoutGrid, Plus } from 'lucide-react';
import { useState } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';

import ReservationForm from '@/components/Reservations/ReservationForm';
import ReservationList from '@/components/Reservations/ReservationList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type {
    Accommodation,
    BreadcrumbItem,
    Channel, Paginated,
    Reservation,
    Unit,
} from '@/types';

export type PaginatedReservations = Paginated & {
    data: Reservation[];
};

type Props = {
    reservations: PaginatedReservations;
    channels: Channel[];
    accommodations: Accommodation[];
    activeTab: string;
    units: Unit[]
};

const TABS = [
    { label: 'Toutes', id: 'all', href: '/reservations', icon: LayoutGrid },
    { label: 'Arrivées', id: 'arrivals', href: '/reservations/arrivals', icon: CalendarCheck },
    { label: 'Départs', id: 'departures', href: '/reservations/departures', icon: CalendarClock },
    { label: 'En attente', id: 'requests', href: '/reservations/requests', icon: Clock },
    { label: 'Séjours en cours', id: 'stay-overs', href: '/reservations/stay-overs', icon: Bed },
    { label: 'Archive', id: 'archive', href: '/reservations/archive', icon: Archive },
];

export default function ReservationIndex({ reservations, channels, accommodations, activeTab, units }: Props) {
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

                    <Button onClick={() => {
                        setEditingReservation(null);
                        setFormOpen(true);
                    }}>
                        <Plus className="mr-2 size-4" />
                        Nouvelle reservation
                    </Button>
                </div>

                <div className="flex overflow-x-auto border-b border-border scrollbar-hide">
                    {TABS.map((tab) => (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 hover:text-primary ${
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
                    channels={channels}
                    accommodations={accommodations}
                    units={units}
                />
            </section>
        </AppLayout>
    );
}
