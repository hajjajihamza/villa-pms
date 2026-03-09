import { useForm } from '@inertiajs/react';
import { Percent } from 'lucide-react';
import { useEffect } from 'react';
import type {FormEvent} from 'react';
import ChannelController from '@/actions/App/Http/Controllers/Settings/Channel/ChannelController';
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

type ChannelFormData = {
    name: string;
    commission: string;
    color: string;
};

type Props = {
    open: boolean;
    channel?: Channel | null;
    onOpenChange: (open: boolean) => void;
};

const initialData: ChannelFormData = {
    name: '',
    commission: '0',
    color: '#f97316',
};

function parseNumber(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export default function ChannelForm({ open, channel, onOpenChange }: Props) {
    const isEditing = Boolean(channel);

    const form = useForm<ChannelFormData>(initialData);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (channel) {
            form.setData({
                name: channel.name,
                commission: String(channel.commission ?? 0),
                color: channel.color ?? '',
            });
            return;
        }

        form.setData(initialData);
    }, [open, channel]);

    const closeAndReset = () => {
        form.reset();
        form.clearErrors();
        onOpenChange(false);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEditing && channel) {
            form.put(ChannelController.update(channel.id).url, {
                preserveScroll: true,
                onSuccess: closeAndReset,
            });
            return;
        }

        form.post(ChannelController.store().url, {
            preserveScroll: true,
            onSuccess: closeAndReset,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] rounded-2xl border-0 p-0 shadow-xl sm:max-w-2xl">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle>
                        {isEditing ? 'Modifier un canal' : 'Creer un canal'}
                    </DialogTitle>
                    <DialogDescription>
                        Configurez les canaux de reservation et leurs
                        commissions.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 px-6 pt-2 pb-6">
                    <ScrollArea className="max-h-[62vh] pr-2">
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
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="Booking"
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
                                id="channel-commission"
                                label="Commission"
                                icon={<Percent className="size-4" />}
                                value={parseNumber(form.data.commission)}
                                min={0}
                                max={100}
                                step={0.5}
                                unit="%"
                                error={form.errors.commission}
                                onChange={(value) =>
                                    form.setData('commission', String(value))
                                }
                            />

                            {/* Color picker */}
                            <InputColorPicker
                                id="channel-color"
                                label="Identité visuelle"
                                value={form.data.color}
                                onChange={(color) =>
                                    form.setData('color', color)
                                }
                                error={form.errors.color}
                            />
                        </div>
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
