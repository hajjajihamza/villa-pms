import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';

import ReservationForm from '@/components/Reservations/ReservationForm';
import ReservationList from '@/components/Reservations/ReservationList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { Accommodation, BreadcrumbItem, Channel, Reservation } from '@/types';

type PaginatedReservations = {
    data: Reservation[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    reservations: PaginatedReservations;
    channels: Channel[];
    accommodations: Accommodation[];
};

export default function ReservationIndex({ reservations, channels, accommodations }: Props) {
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
                />
            </section>
        </AppLayout>
    );
}
