import { useForm } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, X } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import VisitorController from '@/actions/App/Http/Controllers/Reservation/VisitorController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CountryDropdown } from '@/components/ui/country-dropdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import 'react-international-phone/style.css';
import { cn } from '@/lib/utils';
import type { Visitor } from '@/types/models';
import { useEffect } from 'react';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    reservationId: number;
    visitor?: Visitor;
    onCancel?: () => void;
    onSuccess?: () => void;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function VisitorForm({ reservationId, visitor, onCancel, onSuccess }: Props) {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const isEditing = !!visitor;
    const queryClient = useQueryClient();

    const { data, setData, post, put, processing, errors, reset } = useForm({
        full_name: visitor?.full_name || '',
        phone: visitor?.phone || '',
        country: visitor?.country || 'MA',
        is_main: visitor?.is_main || false,
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(VisitorController.updateVisitor.url(visitor.id), {
                preserveScroll: true,
                onSuccess: () => {
                    queryClient.resetQueries({ queryKey: ['reservation', reservationId] });
                    onSuccess?.();
                },
            });
        } else {
            post(VisitorController.storeVisitor.url(reservationId), {
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
        }
    }, [visitor]);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Card className="overflow-hidden border-border bg-card shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all dark:bg-card/50 p-0 gap-0">
            {/* Header */}
            <CardHeader className="border-b border-border pt-3 [.border-b]:pb-2">
                <CardTitle className="text-[14px] font-bold">
                    {isEditing ? 'Modifier Visiteur' : 'Nouveau Visiteur'}
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
                {/* Full Name */}
                <div className="space-y-2">
                    <Label htmlFor="expense-name">Nom Complet</Label>
                    <Input
                        id="expense-name"
                        autoFocus
                        value={data.full_name}
                        onChange={(event) =>
                            setData('full_name', event.target.value)
                        }
                        placeholder="Nom complet"
                        className={cn(
                            'h-10 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                            errors.full_name &&
                            'border-destructive',
                        )}
                    />
                    <InputError message={errors.full_name} />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Country */}
                    <div className="space-y-1">
                        <Label htmlFor="country">Pays / Nationalité</Label>
                        <CountryDropdown
                            placeholder="Sélectionner un pays"
                            defaultValue={data.country.toUpperCase()}
                            onChange={(country) => setData('country', country)}
                        />
                        <InputError message={errors.country} />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                        <Label htmlFor="phone">Téléphone (Optionnel)</Label>

                        <PhoneInput
                            defaultCountry="ma"
                            value={data.phone}
                            onChange={(val, { inputValue }) =>
                                inputValue.trim() !== val.trim() &&
                                setData('phone', val)
                            }
                            inputClassName={cn(
                                'w-full',
                                errors.phone && 'border-destructive',
                            )}
                            className="h-11"
                        />
                        <InputError message={errors.phone} />
                    </div>
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
