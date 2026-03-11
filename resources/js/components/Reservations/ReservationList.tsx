import { Link } from '@inertiajs/react';
import { useState } from 'react';
import ReservationCard from '@/components/Reservations/ReservationCard';
import ReservationDetailsModal from '@/components/Reservations/ReservationDetailsModal';
import { Button } from '@/components/ui/button';
import type { Reservation } from '@/types';

type PaginatedReservations = {
    data: Reservation[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    reservations: PaginatedReservations;
    onEdit: (reservation: Reservation) => void;
};

export default function ReservationList({ reservations, onEdit }: Props) {
    const [open, setOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    const openDetails = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setOpen(true);
    }

    return (
        <>
            <div className="space-y-6">
                {reservations.data.map((reservation) => (
                    <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onOpenDetails={() => openDetails(reservation)}
                        onEdit={onEdit}
                    />
                ))}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Page {reservations.current_page} sur{' '}
                        {reservations.last_page}
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            disabled={!reservations.prev_page_url}
                        >
                            <Link
                                href={reservations.prev_page_url ?? '#'}
                                preserveScroll
                            >
                                Precedent
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            disabled={!reservations.next_page_url}
                        >
                            <Link
                                href={reservations.next_page_url ?? '#'}
                                preserveScroll
                            >
                                Suivant
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <ReservationDetailsModal
                open={open}
                onOpenChange={setOpen}
                reservation={selectedReservation}
            />
        </>
    );
}
