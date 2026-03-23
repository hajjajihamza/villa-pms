import { useForm } from '@inertiajs/react';
import { Loader2, Save, X } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import VisitorController from '@/actions/App/Http/Controllers/Reservation/VisitorController';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { CountryDropdown } from '@/components/ui/country-dropdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import 'react-international-phone/style.css';
import type { Visitor } from '@/types/models';
import { cn } from '@/lib/utils';
import InputError from '@/components/input-error';


interface Props {
    reservationId: number;
    visitor?: Visitor;
    onCancel?: () => void;
    onSuccess?: () => void;
}

export function VisitorForm({ reservationId, visitor, onCancel, onSuccess }: Props) {
    const isEditing = !!visitor;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        full_name: visitor?.full_name || '',
        phone: visitor?.phone || '',
        country: visitor?.country?.toLowerCase() || 'ma',
        is_main: visitor?.is_main || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(VisitorController.updateVisitor.url(visitor.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onSuccess?.();
                },
            });
        } else {
            post(VisitorController.storeVisitor.url(reservationId), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            });
        }
    };

    return (
        <Card className="border-brand-200 bg-brand-50/30 overflow-hidden py-1 shadow-sm dark:border-brand-500/20 dark:bg-brand-500/5">
            <form onSubmit={handleSubmit} className="space-y-2 p-2 sm:p-3">
                <div className="mb-1 flex items-center justify-between">
                    <CardTitle className="text-[12px] font-bold tracking-tighter text-slate-500 uppercase">
                        {isEditing ? 'Modifier Visiteur' : 'Nouveau Visiteur'}
                    </CardTitle>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-md text-slate-400 hover:text-slate-600"
                            onClick={onCancel}
                        >
                            <X size={12} />
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {/* Full Name */}
                    <div className="space-y-1 sm:col-span-2">
                        <Label
                            htmlFor="full_name"
                        >
                            Nom complet
                        </Label>
                        <Input
                            id="full_name"
                            value={data.full_name}
                            onChange={(e) => setData('full_name', e.target.value)}
                            placeholder="Nom de visiteur"
                            className={cn(
                                'h-9 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                errors.full_name && 'border-destructive',
                            )}
                            required
                            autoFocus
                        />
                        <InputError message={errors.full_name} />
                    </div>

                    {/* Country */}
                    <div className="space-y-1">
                        <Label
                            htmlFor="country"
                        >
                            Pays / Nationalité
                        </Label>
                        <CountryDropdown
                            placeholder="Sélectionner un pays"
                            defaultValue={data.country}
                            onChange={(country) => setData('country', country)}
                        />
                        <InputError message={errors.country} />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                        <Label
                            htmlFor="phone"
                        >
                            Téléphone (Optionnel)
                        </Label>

                        <PhoneInput
                            defaultCountry="ma"
                            value={data.phone}
                            onChange={(val, { inputValue }) => inputValue.trim() !== val.trim() && setData('phone', val)}
                            inputClassName={cn(
                                "w-full",
                                errors.phone && "border-destructive"
                            )}
                            className='h-11'
                        />
                        <InputError message={errors.phone} />
                    </div>
                </div>

                <div className="border-brand-100 mt-1 flex justify-end gap-1.5 border-t pt-2 dark:border-white/5">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Annuler
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader2 size={12} className="mr-1.5 animate-spin" />
                        ) : (
                            <Save size={12} className="mr-1.5" />
                        )}
                        {isEditing ? 'Mettre à jour' : 'Enregistrer'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
