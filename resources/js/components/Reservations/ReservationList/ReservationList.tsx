import { CalendarX } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import ReservationModal from '@/components/Reservations/ReservationDetails/ReservationModal';
import ReservationCard from '@/components/Reservations/ReservationList/ReservationCard';
import type { PaginatedReservations } from '@/pages/reservations';
import type { Reservation } from '@/types';

type Props = {
    reservations: PaginatedReservations;
    onEdit: (reservation: Reservation) => void;
};

export default function ReservationList({ reservations, onEdit }: Props) {
    const [open, setOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

    const openDetails = (id: number) => {
        setSelectedReservationId(id);
        setOpen(true);
    }

    return (
        <>
            <div className="space-y-6">
                {reservations.data.length > 0 ? (
                    <>
                        {reservations.data.map((reservation) => (
                            <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                onOpenDetails={() => openDetails(reservation.id)}
                                onEdit={onEdit}
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

            <ReservationModal
                open={open}
                onOpenChange={setOpen}
                reservationId={selectedReservationId as number}
            />
        </>
    );
}
