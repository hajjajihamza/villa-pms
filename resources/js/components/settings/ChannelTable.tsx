import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Percent } from 'lucide-react';
import { useState } from 'react';
import ChannelController from '@/actions/App/Http/Controllers/Settings/Channel/ChannelController';
import ChannelForm from '@/components/settings/ChannelForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatNumber } from '@/lib/format-number';
import type { Channel } from '@/types';

type Props = {
    channels: Channel[];
};

export default function ChannelTable({ channels }: Props) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Channel | null>(null);

    const openCreate = () => {
        setSelected(null);
        setOpen(true);
    };

    const openEdit = (channel: Channel) => {
        setSelected(channel);
        setOpen(true);
    };

    const remove = (channel: Channel) => {
        if (!confirm(`Supprimer ${channel.name} ?`)) return;
        router.delete(ChannelController.destroy(channel.id), {
            preserveScroll: true,
        });
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-xl">Canaux</CardTitle>
                    <CardDescription>
                        Gérez les canaux de réservation et leurs commissions.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={openCreate} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
                {/* Desktop View */}
                <div className="hidden sm:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Commission</TableHead>
                                <TableHead>Couleur</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {channels.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        Aucun canal pour le moment.
                                    </TableCell>
                                </TableRow>
                            )}
                            {channels.map((channel) => (
                                <TableRow key={channel.id}>
                                    <TableCell className="font-semibold">
                                        {channel.name}
                                    </TableCell>
                                    <TableCell>
                                        {formatNumber(channel.commission, {
                                            endWith: '%',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <ColorBadge color={channel.color} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ActionButtons
                                            onEdit={() => openEdit(channel)}
                                            onDelete={() => remove(channel)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View */}
                <div className="divide-y sm:hidden">
                    {channels.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground italic">
                            Aucun canal disponible.
                        </div>
                    )}
                    {channels.map((channel) => (
                        <div
                            key={channel.id}
                            className="flex items-center justify-between gap-4 p-4"
                        >
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold">
                                        {channel.name}
                                    </span>
                                    <ColorBadge color={channel.color} />
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Percent className="mr-1 h-3 w-3" />
                                    Commission:{' '}
                                    <span className="ml-1 font-medium text-foreground">
                                        {formatNumber(channel.commission, {
                                            endWith: '%',
                                        })}
                                    </span>
                                </div>
                            </div>
                            <ActionButtons
                                onEdit={() => openEdit(channel)}
                                onDelete={() => remove(channel)}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>

            <ChannelForm
                open={open}
                channel={selected}
                onOpenChange={setOpen}
            />
        </Card>
    );
}

// Reusable Sub-components for consistency
function ColorBadge({ color }: { color?: string }) {
    if (!color)
        return (
            <Badge variant="outline" className="text-[10px]">
                N/D
            </Badge>
        );
    return (
        <Badge
            variant="secondary"
            className="gap-1.5 px-2 py-0 font-mono text-[10px]"
        >
            <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: color }}
            />
            {color}
        </Badge>
    );
}

function ActionButtons({
    onEdit,
    onDelete,
}: {
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-sky-200 text-sky-600 hover:bg-sky-50"
                onClick={onEdit}
            >
                <Pencil className="h-4 w-4" />
            </Button>
            <Button
                variant="destructive"
                size="icon"
                className="h-9 w-9"
                onClick={onDelete}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
