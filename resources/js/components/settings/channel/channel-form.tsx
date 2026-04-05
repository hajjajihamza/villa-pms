import { useForm } from '@inertiajs/react';
import { Percent, Save, X } from 'lucide-react';
import type { SubmitEvent } from 'react';
import { useEffect } from 'react';
import ChannelController from '@/actions/App/Http/Controllers/Settings/ChannelController';
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
import type { Channel } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type ChannelFormData = {
    name: string;
    commission: number;
    color: string;
};

type Props = {
    open: boolean;
    channel?: Channel | null;
    onOpenChange: (open: boolean) => void;
};

// ────────────────────────────────────────────────
//  Tools
// ────────────────────────────────────────────────
const initialData: ChannelFormData = {
    name: '',
    commission: 0,
    color: '#f97316',
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function ChannelForm({ open, channel, onOpenChange }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const isEditing = !!channel;
    const { data, setData, put, post, processing, errors, reset, clearErrors } = useForm<ChannelFormData>(initialData);

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

        if (isEditing && channel) {
            put(ChannelController.update(channel.id).url, {
                preserveScroll: true,
                onSuccess: handleCloseAndReset,
            });
            return;
        }

        post(ChannelController.store().url, {
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

        // if editing, fill the form with the channel data
        if (isEditing && channel) {
            setData({
                name: channel.name,
                commission: channel.commission ?? 0,
                color: channel.color ?? '',
            });
            return;
        }

        setData(initialData);
    }, [open, channel]);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-0 p-0 shadow-2xl sm:max-w-2xl overflow-hidden bg-background">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle>
                        {isEditing ? 'Modifier un canal' : 'Creer un canal'}
                    </DialogTitle>
                    <DialogDescription>
                        Configurez les canaux de reservation et leurs commissions.
                    </DialogDescription>
                </DialogHeader>

                {/* form */}
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* scroll area */}
                    <ScrollArea className="px-4 lg:px-8 max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-4 pb-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="channel-name"
                                    className="text-[13px] font-medium text-foreground/90"
                                >
                                    Nom
                                </Label>
                                <Input
                                    id="channel-name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="Booking"
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
                                id="channel-commission"
                                label="Commission"
                                icon={<Percent className="size-4" />}
                                value={data.commission}
                                min={0}
                                max={100}
                                step={0.5}
                                unit="%"
                                error={errors.commission}
                                onChange={(value) =>
                                    setData('commission', value)
                                }
                            />

                            {/* Color picker */}
                            <InputColorPicker
                                id="channel-color"
                                label="Identité visuelle"
                                value={data.color}
                                onChange={(color) =>
                                    setData('color', color)
                                }
                                error={errors.color}
                            />
                        </div>
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
                            variant="primary"
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

