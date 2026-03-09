import { useForm } from '@inertiajs/react';
import { HandCoins, User, Users } from 'lucide-react';
import {  useEffect } from 'react';
import type {FormEvent} from 'react';
import AccommodationController from '@/actions/App/Http/Controllers/Settings/Accommodation/AccommodationController';
import InputColorPicker from '@/components/input-color-picker';
import InputCounter from '@/components/input-counter';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Accommodation } from '@/types';

type AccommodationFormData = {
    name: string;
    daily_price: string;
    max_adults: string;
    max_children: string;
    service_price: string;
    color: string;
};

type Props = {
    open: boolean;
    accommodation?: Accommodation | null;
    onOpenChange: (open: boolean) => void;
};

const initialData: AccommodationFormData = {
    name: '',
    daily_price: '0',
    max_adults: '1',
    max_children: '0',
    service_price: '0',
    color: '#0ea5e9',
};

function parseNumber(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export default function AccommodationForm({ open, accommodation, onOpenChange }: Props) {
    const isEditing = Boolean(accommodation);

    const form = useForm<AccommodationFormData>(initialData);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (accommodation) {
            form.setData({
                name: accommodation.name,
                daily_price: String(accommodation.daily_price ?? 0),
                max_adults: String(accommodation.max_adults ?? 0),
                max_children: String(accommodation.max_children ?? 0),
                service_price: String(accommodation.service_price ?? 0),
                color: accommodation.color ?? '',
            });

            return;
        }

        form.setData(initialData);
    }, [open, accommodation]);

    const closeAndReset = () => {
        form.reset();
        form.clearErrors();
        onOpenChange(false);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEditing && accommodation) {
            form.put(AccommodationController.update(accommodation.id).url, {
                preserveScroll: true,
                onSuccess: closeAndReset,
            });
            return;
        }

        form.post(AccommodationController.store().url, {
            preserveScroll: true,
            onSuccess: closeAndReset,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] rounded-2xl border-0 p-0 shadow-xl sm:max-w-3xl">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle>
                        {isEditing
                            ? 'Modifier un hebergement'
                            : 'Creer un hebergement'}
                    </DialogTitle>
                    <DialogDescription>
                        Configurez les tarifs et la capacite de cet hebergement.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 px-6 pt-2 pb-6">
                    <ScrollArea className="max-h-[62vh] pr-2">
                        <div className="grid gap-4 pb-2 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label
                                    htmlFor="accommodation-name"
                                    className="text-[13px] font-medium text-foreground/90"
                                >
                                    Nom
                                </Label>
                                <Input
                                    id="accommodation-name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="Appartement A"
                                    aria-invalid={Boolean(form.errors.name)}
                                    className={cn(
                                        'h-11 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                        form.errors.name &&
                                            'border-destructive',
                                    )}
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <InputCounter
                                id="accommodation-daily-price"
                                label="Prix journalier"
                                icon={<HandCoins className="size-4" />}
                                value={parseNumber(form.data.daily_price)}
                                min={0}
                                step={10}
                                unit="DH"
                                error={form.errors.daily_price}
                                onChange={(value) =>
                                    form.setData('daily_price', String(value))
                                }
                            />

                            <InputCounter
                                id="accommodation-service-price"
                                label="Frais de service"
                                icon={<HandCoins className="size-4" />}
                                value={parseNumber(form.data.service_price)}
                                min={0}
                                step={10}
                                unit="DH"
                                error={form.errors.service_price}
                                onChange={(value) =>
                                    form.setData('service_price', String(value))
                                }
                            />

                            <InputCounter
                                id="accommodation-max-adults"
                                label="Adultes max"
                                icon={<Users className="size-4" />}
                                value={parseNumber(form.data.max_adults)}
                                min={1}
                                step={1}
                                error={form.errors.max_adults}
                                onChange={(value) =>
                                    form.setData('max_adults', String(value))
                                }
                            />

                            <InputCounter
                                id="accommodation-max-children"
                                label="Enfants max"
                                icon={<User className="size-4" />}
                                value={parseNumber(form.data.max_children)}
                                min={0}
                                step={1}
                                error={form.errors.max_children}
                                onChange={(value) =>
                                    form.setData('max_children', String(value))
                                }
                            />
                        </div>

                        <InputColorPicker
                            id="accommodation-color"
                            label="Identite visuelle"
                            value={form.data.color}
                            onChange={(color) => form.setData('color', color)}
                            error={form.errors.color}
                        />
                    </ScrollArea>

                    <DialogFooter className="border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeAndReset}
                            className="rounded-xl"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-xl"
                        >
                            {isEditing ? 'Mettre a jour' : 'Creer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
