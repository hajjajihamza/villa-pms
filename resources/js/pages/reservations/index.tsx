import { Head, Link } from '@inertiajs/react';
import { Archive, Bed, CalendarCheck, CalendarClock, CalendarX, List, Plus } from 'lucide-react';
import { useState } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import ReservationFilters from '@/components/Reservations/forms/reservation-filters';
import ReservationForm from '@/components/Reservations/forms/reservation-form';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type {
    Accommodation,
    BreadcrumbItem,
    Paginated,
    Reservation,
} from '@/types';
import ReservationModal from '@/components/Reservations/info/reservation-modal';
import ReservationCard from '@/components/Reservations/info/reservation-card';
import Pagination from '@/components/pagination';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
export type PaginatedReservations = Paginated & {
    data: Reservation[];
};

type Props = {
    reservations: PaginatedReservations;
    accommodations: Accommodation[];
    activeTab: string;
};

// ────────────────────────────────────────────────
//  Constants
// ────────────────────────────────────────────────
const TABS = [
    { label: 'Arrivées', id: 'arrivals', href: ReservationController.index().url, icon: CalendarCheck },
    { label: 'Départs', id: 'departures', href: ReservationController.departures().url, icon: CalendarClock },
    { label: 'Séjours en cours', id: 'stay-overs', href: ReservationController.stayOvers().url, icon: Bed },
    { label: 'Archive', id: 'archive', href: ReservationController.archive().url, icon: Archive },
    { label: 'Toutes', id: 'all', href: ReservationController.all().url, icon: List },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reservations',
        href: ReservationController.index(),
    },
];

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function ReservationIndex({ reservations, accommodations, activeTab }: Props) {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const [formOpen, setFormOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            title='Reservations'
            description='Gerez les sejours, la validation et les visiteurs supplementaires.'
            action={
                <Button
                    onClick={() => {
                        setEditingReservation(null);
                        setFormOpen(true);
                    }}
                >
                    <Plus className="mr-2 size-4" />
                    Nouvelle reservation
                </Button>
            }
        >
            <Head title="Reservations" />

            {/* filters */}
            <ReservationFilters accommodations={accommodations} />

            {/* tabs */}
            <div className="scrollbar-hide flex overflow-x-auto border-b border-border">
                {TABS.map((tab) => (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground'
                            }`}
                    >
                        <tab.icon className="size-4" />
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* list */}
            <div className="space-y-6 mt-1">
                {reservations.data.length > 0 ? (
                    <>
                        {reservations.data.map((reservation) => (
                            <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                onOpenDetails={() => setSelectedReservationId(reservation.id)}
                                onEdit={(reservation) => {
                                    setEditingReservation(reservation);
                                    setFormOpen(true);
                                }}
                            />
                        ))}

                        <Pagination
                            data={{
                                count: reservations.data.length,
                                total: reservations.total,
                                current_page: reservations.current_page,
                                last_page: reservations.last_page,
                                prev_page_url: reservations.prev_page_url,
                                next_page_url: reservations.next_page_url,
                            }}
                            label="réservations"
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <CalendarX className="size-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">Aucune réservation trouvée</h3>
                        <p className="text-sm text-muted-foreground">Il n'y a pas de réservation correspondant à ce filtre pour le moment.</p>
                    </div>
                )}
            </div>

            {/* modal details */}
            <ReservationModal
                open={!!selectedReservationId}
                onOpenChange={(open) => !open && setSelectedReservationId(null)}
                reservationId={selectedReservationId as number}
            />

            {/* modal form */}
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
        </AppLayout>
    );
}
