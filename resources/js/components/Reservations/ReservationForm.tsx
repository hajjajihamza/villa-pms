import { Suspense } from 'react';
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
import type { Reservation } from '@/types';
import { Badge } from '../ui/badge';
import { ReservationProvider, useReservation } from './ReservationContext';
import StepBooking, { StepBookingSkeleton } from './StepBooking';
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
    documents: { file?: File | null, type: string, id?: number, url?: string }[];
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation?: Reservation | null;
    defaultDate?: string | null;
};

export default function ReservationForm(props: Props) {
    return (
        <ReservationProvider {...props}>
            <ReservationFormContent />
        </ReservationProvider>
    );
}

function ReservationFormContent() {
    const {
        form,
        step,
        totalSteps,
        isEditing,
        reservation,
        isValid,
        nextStep,
        prevStep,
        closeAndReset,
        submit
    } = useReservation();

    const progressValue = (step / totalSteps) * 100;

    return (
        <Dialog open={false} onOpenChange={closeAndReset}>
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
                            <Suspense
                                fallback={<StepBookingSkeleton />}
                            >
                                <StepBooking />
                            </Suspense>
                        ) : (
                            <StepVisitor />
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
