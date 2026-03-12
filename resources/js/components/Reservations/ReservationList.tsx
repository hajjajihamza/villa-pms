import { Link } from '@inertiajs/react';
import { CalendarX } from 'lucide-react';
import { useState } from 'react';
import ReservationCard from '@/components/Reservations/ReservationCard';
import ReservationDetailsModal from '@/components/Reservations/ReservationDetailsModal';
import { Button } from '@/components/ui/button';
import type { Reservation } from '@/types';
import type { PaginatedReservations } from '@/pages/reservations';

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
                {reservations.data.length > 0 ? (
                    <>
                        {reservations.data.map((reservation) => (
                            <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                onOpenDetails={() => openDetails(reservation)}
                                onEdit={onEdit}
                            />
                        ))}

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border">
                            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                                Affichage de <span className="font-medium text-foreground">{reservations.data.length}</span> sur <span className="font-medium text-foreground">{reservations.total}</span> réservations
                                <span className="mx-2 font-light opacity-50">|</span>
                                Page {reservations.current_page} sur {reservations.last_page}
                            </div>

                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <Button
                                    asChild={!!reservations.prev_page_url}
                                    variant="outline"
                                    size="sm"
                                    disabled={!reservations.prev_page_url}
                                >
                                    {reservations.prev_page_url ? (
                                        <Link
                                            href={reservations.prev_page_url}
                                            preserveScroll
                                        >
                                            Précédent
                                        </Link>
                                    ) : (
                                        <span>Précédent</span>
                                    )}
                                </Button>

                                <Button
                                    asChild={!!reservations.next_page_url}
                                    variant="outline"
                                    size="sm"
                                    disabled={!reservations.next_page_url}
                                >
                                    {reservations.next_page_url ? (
                                        <Link
                                            href={reservations.next_page_url}
                                            preserveScroll
                                        >
                                            Suivant
                                        </Link>
                                    ) : (
                                        <span>Suivant</span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <CalendarX className="size-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">Aucune réservation trouvée</h3>
                        <p className="text-sm text-muted-foreground">Il n'y a pas de réservation correspondant à ce filtre pour le moment.</p>
                    </div>
                )}
            </div>

            <ReservationDetailsModal
                open={open}
                onOpenChange={setOpen}
                reservation={selectedReservation}
            />
        </>
    );
}
