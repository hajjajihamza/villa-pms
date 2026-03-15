import { useForm } from '@inertiajs/react';
import { startOfToday, addDays } from 'date-fns';
import { useEffect, useState } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toFormDate } from '@/lib/format-date';
import type { Accommodation, Channel, Reservation, Unit } from '@/types';
import { Badge } from '../ui/badge';
import StepBooking from './StepBooking';
import StepVisitor from './StepVisitor';

export type ReservationFormData = {
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    advance_amount: number;
    total: number;
    channel_id?: number;
    accommodation_id?: number;
    // Visitor info
    full_name: string;
    phone: string;
    country: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    channels: Channel[];
    accommodations: Accommodation[];
    reservation?: Reservation | null;
    units: Unit[]
};

const initialData: ReservationFormData = {
    check_in: toFormDate(startOfToday()),
    check_out: toFormDate(addDays(startOfToday(), 1)),
    adults: 1,
    children: 0,
    total: 0,
    advance_amount: 0,
    channel_id: undefined,
    accommodation_id: undefined,
    full_name: '',
    phone: '',
    country: 'MA',
};

export default function ReservationForm({
    open,
    onOpenChange,
    channels,
    accommodations,
    reservation,
    units
}: Props) {
    const form = useForm<ReservationFormData>();
    const isEditing = Boolean(reservation);

    const [step, setStep] = useState<number>(1);
    const totalSteps = 2;

    const progressValue = (step / totalSteps) * 100;

    const isValid = () => {
        const requiredFields = ['check_in', 'check_out', 'accommodation_id', 'channel_id'];
        return requiredFields.every((field) => !!form.data[field as keyof ReservationFormData]);
    };

    const nextStep = () => {
        if (step === 1) {
            if (!isValid()) {
                return;
            }
        }
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const closeAndReset = () => {
        form.reset();
        form.clearErrors();
        setStep(1);
        onOpenChange(false);
    };

    useEffect(() => {
        if (!open) {
            form.setData(initialData);
            return;
        }

        if (reservation) {
            form.setData({
                ...initialData,
                check_in: reservation.check_in,
                check_out: reservation.check_out,
                adults: reservation.adults,
                children: reservation.children,
                advance_amount: reservation.advance_amount ?? 0,
                channel_id: reservation.channel_id,
                accommodation_id: reservation.accommodation_id,
                total: reservation.total_price ?? 0,
                full_name: reservation.main_visitor?.full_name ?? '',
                phone: reservation.main_visitor?.phone ?? '',
                country: reservation.main_visitor?.country ?? 'ma',
            });
        } else {
            form.setData(initialData);
            if (channels.length > 0 && !form.data.channel_id) {
                form.setData('channel_id', channels[0].id);
            }
        }
    }, [reservation, open]);

    const submit = () => {
        if (reservation) {
            form.put(ReservationController.update(reservation.id).url, {
                preserveScroll: true,
                onSuccess: () => closeAndReset(),
            });
            return;
        }

        form.post(ReservationController.store().url, {
            preserveScroll: true,
            onSuccess: () => closeAndReset(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-0 p-0 shadow-2xl sm:max-w-2xl overflow-hidden bg-background">
                <DialogHeader className="border-b px-6 py-4 pb-1">
                    <DialogTitle className="text-xl">
                        {step === 1 ? (isEditing ? 'Modifier la réservation' : 'Nouvelle réservation') : 'Détails du visiteur'}
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground font-medium">
                        <Badge className='text-xs font-bold uppercase tracking-widest text-primary bg-primary/10'>
                            Étape {step} sur {totalSteps}
                        </Badge>

                        <Progress value={progressValue} className="h-1 rounded-none transition-all duration-500 ease-in-out my-2" />
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col">
                    <ScrollArea className="px-8 max-h-[60vh] overflow-y-auto">
                        {step === 1 ? (
                            <StepBooking
                                data={form.data}
                                setData={form.setData}
                                errors={form.errors}
                                channels={channels}
                                accommodations={accommodations}
                                isEditing={isEditing}
                                units={units}
                                reservation={reservation}
                            />
                        ) : (
                            <StepVisitor
                                data={form.data}
                                setData={form.setData}
                                errors={form.errors}
                            />
                        )}
                    </ScrollArea>

                    <DialogFooter className="border-t mt-2 bg-muted/30 px-8 py-6 grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={step === 1 ? closeAndReset : prevStep}
                            size="lg"
                        >
                            {step === 1 ? 'Annuler' : 'Retour'}
                        </Button>

                        {step === 1 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                size="lg"
                                disabled={!isValid()}
                            >
                                Continuer
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                onClick={submit}
                                disabled={form.processing || form.data.full_name.length === 0}
                                size="lg"
                            >
                                {form.processing ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Confirmer')}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
