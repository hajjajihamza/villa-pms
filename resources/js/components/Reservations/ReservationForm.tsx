import { useForm } from '@inertiajs/react';
import { startOfToday, addDays } from 'date-fns';
import { useEffect, useState } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import type { Accommodation, Channel, Reservation } from '@/types';
import StepBooking from './StepBooking';
import StepVisitor from './StepVisitor';
import { Badge } from '../ui/badge';
import { toFormDate } from '@/lib/format-date';

type ReservationFormData = {
    check_in: string;
    check_out: string;
    adults: string;
    children: string;
    advance_amount: string;
    total: string;
    channel_id: string;
    accommodation_id: string;
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
};

const initialData: ReservationFormData = {
    check_in: toFormDate(startOfToday()),
    check_out: toFormDate(addDays(startOfToday(), 1)),
    adults: '1',
    children: '0',
    total: '0',
    advance_amount: '0',
    channel_id: '',
    accommodation_id: '',
    full_name: '',
    phone: '',
    country: 'ma',
};

export default function ReservationForm({
    open,
    onOpenChange,
    channels,
    accommodations,
    reservation,
}: Props) {
    initialData.channel_id = String(channels[0].id);
    const form = useForm<ReservationFormData>(initialData);
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
                // Optionally set errors manually or just prevent progression
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
        if (!open) return;

        if (reservation) {
            form.setData({
                ...initialData,
                check_in: reservation.check_in,
                check_out: reservation.check_out,
                adults: String(reservation.adults),
                children: String(reservation.children),
                advance_amount: String(reservation.advance_amount ?? 0),
                daily_price: String(reservation.daily_price ?? 0),
                service_price: String(reservation.service_price ?? 0),
                channel_id: String(reservation.channel_id),
                accommodation_id: String(reservation.accommodation_id),
                total: String(reservation.total_price ?? 0),
            });
        } else {
            form.setData(initialData);
            if (channels.length > 0 && !form.data.channel_id) {
                form.setData('channel_id', String(channels[0].id));
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
            <DialogContent className="rounded-[2rem] border-0 p-0 shadow-2xl sm:max-w-2xl overflow-hidden bg-background">
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
