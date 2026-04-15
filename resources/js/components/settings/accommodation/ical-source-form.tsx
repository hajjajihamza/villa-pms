import { useForm } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect, type SubmitEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Channel, IcalSource } from '@/types';
import IcalSourceController from '@/actions/App/Http/Controllers/Settings/IcalSourceController';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    accommodationId: number;
    channels: Channel[];
    onCancel: () => void;
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function IcalSourceForm({ accommodationId, channels, onCancel }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const queryClient = useQueryClient();

    // inertia form
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<Partial<IcalSource>>();

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();

        post(IcalSourceController.store(accommodationId).url, {
            preserveScroll: true,
            onSuccess: () => {
                queryClient.resetQueries({ queryKey: ['ical-sources', accommodationId] });
                onCancel();
            },
        });
    };

    // ────────────────────────────────────────────────
    //  Effects
    // ────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            reset();
            clearErrors();
        };
    }, []);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} className='mb-2'>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label className="text-[13px] font-medium">Canal</Label>
                    <Select
                        value={(data.channel_id)?.toString()}
                        onValueChange={(value) => setData('channel_id', Number(value))}
                    >
                        <SelectTrigger className={cn('w-full', errors.channel_id && 'border-destructive')}>
                            <SelectValue placeholder="Sélectionner un canal" />
                        </SelectTrigger>
                        <SelectContent>
                            {channels.map((channel) => (
                                <SelectItem key={channel.id} value={channel.id.toString()}>
                                    {channel.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.channel_id} />
                </div>

                <div className="space-y-2">
                    <Label className="text-[13px] font-medium">URL iCal</Label>
                    <Input
                        type='url'
                        value={data.url}
                        onChange={(e) => setData('url', e.target.value)}
                        placeholder="https://..."
                        className={cn('h-9', errors.url && 'border-destructive')}
                        required
                    />
                    <InputError message={errors.url} />
                </div>
            </div>

            <div className="grid gap-2 border-t bg-muted/30 sm:grid-cols-1 md:grid-cols-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={processing}
                >
                    <X size={12} className="mr-1.5" />
                    Annuler
                </Button>

                <Button type="submit" disabled={processing}>
                    {processing ? (
                        <Loader2
                            size={12}
                            className="mr-1.5 animate-spin"
                        />
                    ) : (
                        <>
                            <Save size={12} className="mr-1.5" />
                            Ajouter
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
