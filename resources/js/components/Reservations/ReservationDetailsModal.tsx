import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDateDisplay } from '@/lib/format-date';
import type { Reservation } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: Reservation | null;
};

type VisitorFormData = {
    full_name: string;
    document_number: string;
    phone: string;
};

const initialVisitorData: VisitorFormData = {
    full_name: '',
    document_number: '',
    phone: '',
};

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value || '-'}</span>
        </div>
    );
}

function formatCurrency(value?: number) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 2,
    }).format(value ?? 0);
}

export default function ReservationDetailsModal({ open, onOpenChange,reservation }: Props) {
    const visitorForm = useForm<VisitorFormData>(initialVisitorData);

    const submitVisitor = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!reservation) {
            return;
        }

        visitorForm.post(ReservationController.storeVisitor(reservation.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                visitorForm.reset();
                visitorForm.clearErrors();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Reservation details</DialogTitle>
                    <DialogDescription>
                        Consultez le sejour et ajoutez les visiteurs supplementaires.
                    </DialogDescription>
                </DialogHeader>

                {!reservation ? null : (
                    <ScrollArea className="max-h-[72vh] pr-4">
                        <div className="space-y-6">
                            <div className="grid gap-3 md:grid-cols-2">
                                <DetailRow label="Accommodation" value={reservation.accommodation?.name} />
                                <DetailRow label="Channel" value={reservation.channel?.name} />
                                <DetailRow label="Check-in" value={formatDateDisplay(reservation.check_in)} />
                                <DetailRow label="Check-out" value={formatDateDisplay(reservation.check_out)} />
                                <DetailRow label="Real check-in" value={formatDateDisplay(reservation.real_check_in)} />
                                <DetailRow label="Real check-out" value={formatDateDisplay(reservation.real_check_out)} />
                                <DetailRow label="Adults" value={reservation.adults} />
                                <DetailRow label="Children" value={reservation.children} />
                                <DetailRow label="Advance amount" value={formatCurrency(reservation.advance_amount)} />
                                <DetailRow label="Daily price" value={formatCurrency(reservation.daily_price)} />
                                <DetailRow label="Service price" value={formatCurrency(reservation.service_price)} />
                                <DetailRow label="Created by" value={reservation.creator?.name} />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold">Additional visitors</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Ajoutez les visiteurs apres la creation de la reservation.
                                    </p>
                                </div>

                                <form onSubmit={submitVisitor} className="grid gap-4 rounded-2xl border p-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="visitor-name">Name</Label>
                                        <Input
                                            id="visitor-name"
                                            value={visitorForm.data.full_name}
                                            onChange={(event) => visitorForm.setData('full_name', event.target.value)}
                                            placeholder="Nom complet"
                                        />
                                        <InputError message={visitorForm.errors.full_name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="visitor-document">Document number</Label>
                                        <Input
                                            id="visitor-document"
                                            value={visitorForm.data.document_number}
                                            onChange={(event) => visitorForm.setData('document_number', event.target.value)}
                                            placeholder="Numero de document"
                                        />
                                        <InputError message={visitorForm.errors.document_number} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="visitor-phone">Phone</Label>
                                        <Input
                                            id="visitor-phone"
                                            value={visitorForm.data.phone}
                                            onChange={(event) => visitorForm.setData('phone', event.target.value)}
                                            placeholder="Telephone"
                                        />
                                        <InputError message={visitorForm.errors.phone} />
                                    </div>

                                    <div className="md:col-span-3">
                                        <Button type="submit" disabled={visitorForm.processing}>
                                            Ajouter le visiteur
                                        </Button>
                                    </div>
                                </form>

                                <div className="space-y-3">
                                    {(reservation.visitors ?? []).length === 0 ? (
                                        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            Aucun visiteur supplementaire pour le moment.
                                        </div>
                                    ) : (
                                        (reservation.visitors ?? []).map((visitor) => (
                                            <div key={visitor.id} className="grid gap-2 rounded-2xl border p-4 md:grid-cols-3">
                                                <DetailRow label="Name" value={visitor.full_name} />
                                                <DetailRow label="Document" value={visitor.document_number} />
                                                <DetailRow label="Phone" value={visitor.phone} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
