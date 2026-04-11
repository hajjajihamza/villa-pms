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
import type { IcalSource, Unit } from '@/types';
import IcalSourceController from '@/actions/App/Http/Controllers/Settings/IcalSourceController';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    channelId: number;
    availableUnits: Unit[];
    source?: IcalSource | null;
    onCancel: () => void;
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function IcalSourceForm({ channelId, availableUnits, source, onCancel }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const isEditing = !!source;
    const queryClient = useQueryClient();

    // inertia form
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<Partial<IcalSource>>({
        channel_id: channelId,
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                queryClient.resetQueries({ queryKey: ['ical-sources', channelId] });
                onCancel();
            },
        };

        if (isEditing && source) {
            put(IcalSourceController.update(source.id).url, options);
        } else {
            post(IcalSourceController.store().url, options);
        }
    };

    // ────────────────────────────────────────────────
    //  Effects
    // ────────────────────────────────────────────────
    useEffect(() => {
        if (isEditing && source) {
            setData({
                unit_id: source.unit_id,
                url: source.url,
                channel_id: channelId,
            });
        }
    }, [isEditing, source]);

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
                    <Label className="text-[13px] font-medium">Unité</Label>
                    <Select
                        value={data.unit_id?.toString()}
                        onValueChange={(value) => setData('unit_id', Number(value))}
                    >
                        <SelectTrigger className={cn('w-full', errors.unit_id && 'border-destructive')}>
                            <SelectValue placeholder="Sélectionner une unité" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableUnits.map((unit) => (
                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                    {unit.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.unit_id} />
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
                            {isEditing ? 'Mettre à jour' : 'Ajouter'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
