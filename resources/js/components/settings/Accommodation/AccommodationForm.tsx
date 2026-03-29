import { useForm } from '@inertiajs/react';
import { HandCoins, Save, User, Users, X } from 'lucide-react';
import type { SubmitEvent } from 'react';
import { useEffect } from 'react';
import AccommodationController from '@/actions/App/Http/Controllers/Settings/AccommodationController';
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


// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type AccommodationFormData = {
    name: string;
    daily_price: number;
    max_adults: number;
    max_children: number;
    service_price: number;
    color: string;
};

type Props = {
    open: boolean;
    accommodation?: Accommodation | null;
    onOpenChange: (open: boolean) => void;
};

// ────────────────────────────────────────────────
//  Tools
// ────────────────────────────────────────────────
const initialData: AccommodationFormData = {
    name: '',
    daily_price: 0,
    max_adults: 1,
    max_children: 0,
    service_price: 0,
    color: '#0ea5e9',
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function AccommodationForm({ open, accommodation, onOpenChange }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const isEditing = !!accommodation;
    const {data, setData, put, post, processing, errors, reset, clearErrors } = useForm<AccommodationFormData>(initialData);

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleCloseAndReset = () => {
        reset();
        clearErrors();
        onOpenChange(false);
    };

    const handleSubmit = (event: SubmitEvent) => {
        event.preventDefault();

        if (isEditing && accommodation) {
            put(AccommodationController.update(accommodation.id).url, {
                preserveScroll: true,
                onSuccess: handleCloseAndReset,
            });
            return;
        }

        post(AccommodationController.store().url, {
            preserveScroll: true,
            onSuccess: handleCloseAndReset,
        });
    };

    // ────────────────────────────────────────────────
    //  Hooks
    // ────────────────────────────────────────────────
    useEffect(() => {
        if (!open) {
            return;
        }

        // if editing, fill the form with the accommodation data
        if (isEditing && accommodation) {
            setData({
                name: accommodation.name,
                daily_price: accommodation.daily_price ?? 0,
                max_adults: accommodation.max_adults ?? 0,
                max_children: accommodation.max_children ?? 0,
                service_price: accommodation.service_price ?? 0,
                color: accommodation.color ?? '',
            });
        }
    }, [open, accommodation]);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-0 p-0 shadow-2xl sm:max-w-2xl overflow-hidden bg-background">
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

                {/* form */}
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* scroll area */}
                    <ScrollArea className="px-4 lg:px-8 max-h-[60vh] overflow-y-auto">
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
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="Appartement A"
                                    aria-invalid={Boolean(errors.name)}
                                    className={cn(
                                        'h-11 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                        errors.name &&
                                            'border-destructive',
                                    )}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <InputCounter
                                id="accommodation-daily-price"
                                label="Prix journalier"
                                icon={<HandCoins className="size-4" />}
                                value={data.daily_price}
                                min={0}
                                step={10}
                                unit="DH"
                                error={errors.daily_price}
                                onChange={(value) =>
                                    setData('daily_price', value)
                                }
                            />

                            <InputCounter
                                id="accommodation-service-price"
                                label="Frais de service"
                                icon={<HandCoins className="size-4" />}
                                value={data.service_price}
                                min={0}
                                step={10}
                                unit="DH"
                                error={errors.service_price}
                                onChange={(value) =>
                                    setData('service_price', value)
                                }
                            />

                            <InputCounter
                                id="accommodation-max-adults"
                                label="Adultes max"
                                icon={<Users className="size-4" />}
                                value={data.max_adults}
                                min={1}
                                step={1}
                                error={errors.max_adults}
                                onChange={(value) =>
                                    setData('max_adults', value)
                                }
                            />

                            <InputCounter
                                id="accommodation-max-children"
                                label="Enfants max"
                                icon={<User className="size-4" />}
                                value={data.max_children}
                                min={0}
                                step={1}
                                error={errors.max_children}
                                onChange={(value) =>
                                    setData('max_children', value)
                                }
                            />
                        </div>

                        <InputColorPicker
                            id="accommodation-color"
                            label="Identite visuelle"
                            value={data.color}
                            onChange={(color) => setData('color', color)}
                            error={errors.color}
                        />
                    </ScrollArea>

                    {/* footer */}
                    <DialogFooter className="border-t mt-1 bg-muted/30 px-8 py-6 grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseAndReset}
                            size="lg"
                        >
                            <X className="size-4 mr-2" />
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant='primary'
                            disabled={processing}
                            size="lg"
                        >
                            <Save className="size-4 mr-2" />
                            {processing ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Creer')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
