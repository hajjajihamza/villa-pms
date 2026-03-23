import { useForm } from '@inertiajs/react';
import { addDays, parseISO, startOfToday } from 'date-fns';
import { Suspense, useEffect, useState } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import StepBookingSkeleton from '@/components/Reservations/ReservationSkeleton/StepBookingSkeleton';
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
import type { Reservation } from '@/types';
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
    reservation?: Reservation | null;
    defaultDate?: string | null;
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
    reservation,
    defaultDate
}: Props) {
    const form = useForm<ReservationFormData>();
    const isEditing = Boolean(reservation);

    const [step, setStep] = useState<number>(1);
    const totalSteps = 2;

    const progressValue = (step / totalSteps) * 100;

    const isValid = () => {
        const requiredFields = [
            'check_in',
            'check_out',
            'accommodation_id',
            'channel_id',
        ];
        return requiredFields.every(
            (field) => !!form.data[field as keyof ReservationFormData],
        );
    };

    const closeAndReset = () => {
        form.reset();
        form.clearErrors();
        setStep(1);
        onOpenChange(false);
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

    useEffect(() => {
        if (!open) {
            form.setData(initialData);
            form.clearErrors();
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
                country: reservation.main_visitor?.country ?? 'MA',
            });
        } else {
            form.setData(initialData);
            if (defaultDate) {
                form.setData('check_in', toFormDate(parseISO(defaultDate)));
                form.setData(
                    'check_out',
                    toFormDate(addDays(parseISO(defaultDate), 1)),
                );
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
        <Dialog open={open} onOpenChange={closeAndReset}>
            <DialogContent className="overflow-hidden rounded-2xl border-0 bg-background p-0 shadow-2xl sm:max-w-2xl">
                <DialogHeader className="border-b px-6 py-4 pb-1">
                    <DialogTitle className="text-xl">
                        {step === 1
                            ? isEditing
                                ? 'Modifier la réservation'
                                : 'Nouvelle réservation'
                            : 'Détails du visiteur'}
                    </DialogTitle>
                    <DialogDescription className="text-base font-medium text-muted-foreground">
                        <Badge className="bg-primary/10 text-xs font-bold tracking-widest text-primary uppercase">
                            Étape {step} sur {totalSteps}
                        </Badge>

                        <Progress
                            value={progressValue}
                            className="my-2 h-1 rounded-none transition-all duration-500 ease-in-out"
                        />
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex flex-col"
                >
                    <ScrollArea className="max-h-[60vh] overflow-y-auto px-8">
                        {step === 1 ? (
                            <Suspense fallback={<StepBookingSkeleton />}>
                                <StepBooking
                                    data={form.data}
                                    setData={form.setData}
                                    errors={form.errors}
                                    isEditing={isEditing}
                                    reservation={reservation}
                                />
                            </Suspense>
                        ) : (
                            <StepVisitor
                                data={form.data}
                                setData={form.setData}
                                errors={form.errors}
                            />
                        )}
                    </ScrollArea>

                    <DialogFooter className="mt-2 grid gap-4 border-t bg-muted/30 px-8 py-6 sm:grid-cols-1 md:grid-cols-2">
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
                                disabled={
                                    form.processing ||
                                    form.data.full_name.length === 0
                                }
                                size="lg"
                            >
                                {form.processing
                                    ? 'Enregistrement...'
                                    : isEditing
                                      ? 'Mettre à jour'
                                      : 'Confirmer'}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
