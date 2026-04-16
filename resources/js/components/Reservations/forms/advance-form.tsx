import { useForm } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvanceController from '@/actions/App/Http/Controllers/Reservation/AdvanceController';
import { Card, CardAction, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Advance } from '@/types/models';
import { useEffect, SubmitEvent } from 'react';
import InputCounter from '@/components/input-counter';
import { DatePickerInput } from '@/components/date-picker_input';
import { toFormDate } from '@/lib/format-date';
import { toDate } from 'date-fns';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    reservationId: number;
    advance?: Advance;
    maxAmount?: number;
    onCancel?: () => void;
    onSuccess?: () => void;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function AdvanceForm({ reservationId, advance, maxAmount, onCancel, onSuccess }: Props) {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const isEditing = !!advance;
    const queryClient = useQueryClient();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<Partial<Advance>>({
        amount: advance?.amount,
        reservation_id: reservationId,
        date: advance?.date || toFormDate(new Date()),
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(AdvanceController.update(advance.id).url, {
                preserveScroll: true,
                onSuccess: () => {
                    queryClient.resetQueries({ queryKey: ['reservation', reservationId] });
                    onSuccess?.();
                },
            });
        } else {
            post(AdvanceController.store().url, {
                preserveScroll: true,
                onSuccess: () => {
                    queryClient.resetQueries({ queryKey: ['reservation', reservationId] });
                    reset();
                    onSuccess?.();
                },
            });
        }
    };

    // ────────────────────────────────────────────────
    //  Effects
    // ────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            reset();
            clearErrors();
        }
    }, []);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Card className="overflow-hidden border-border bg-card shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all dark:bg-card/50 p-0 gap-0">
            {/* Header */}
            <CardHeader className="border-b border-border pt-3 [.border-b]:pb-2">
                <CardTitle className="text-[14px] font-bold">
                    {isEditing ? 'Modifier l\'avance' : 'Nouvelle avance'}
                </CardTitle>
                <CardAction>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                    >
                        <X />
                    </Button>
                </CardAction>
            </CardHeader>
            {/* Body */}
            <form onSubmit={handleSubmit} className="space-y-2 p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <InputCounter
                        id="advance-amount"
                        label="Montant"
                        value={data.amount ?? 0}
                        min={0}
                        max={maxAmount}
                        step={10}
                        unit="DH"
                        autoFocus
                        error={errors.amount}
                        onChange={(value) =>
                            setData('amount', value)
                        }
                    />

                    <DatePickerInput
                        id="advance-date"
                        label="Date"
                        selected={data.date ? toDate(data.date) : undefined}
                        onChange={(date) => setData('date', date)}
                        error={errors.date}
                        placeholder="Choisir une date"
                    />
                </div>

                {/* Footer */}
                <CardFooter className="grid gap-2 border-t bg-muted/30 [.border-t]:pt-2 px-2 sm:grid-cols-1 md:grid-cols-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            <X size={12} className="mr-1.5" />
                            Annuler
                        </Button>
                    )}
                    <Button type="submit" disabled={processing}>
                        {processing ? (
                            <Loader2
                                size={12}
                                className="mr-1.5 animate-spin"
                            />
                        ) : (
                            <>
                                <Save size={12} className="mr-1.5" />
                                {isEditing ? 'Mettre à jour' : 'Enregistrer'}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
