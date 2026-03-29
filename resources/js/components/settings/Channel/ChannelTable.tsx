import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Percent } from 'lucide-react';
import { useState } from 'react';
import ChannelController from '@/actions/App/Http/Controllers/Settings/ChannelController';
import ChannelForm from '@/components/settings/Channel/ChannelForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
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

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    channels: Channel[];
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function ChannelTable({ channels }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const [open, setOpen] = useState(false); // dialog open
    const [selected, setSelected] = useState<Channel | null>(null); // object to edit

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
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

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Card className="w-full">
            <CardHeader className='border-b'>
                <CardTitle className="text-xl">Canaux</CardTitle>
                <CardDescription>
                    Gérez les canaux de réservation.
                </CardDescription>
                <CardAction>
                    <Button onClick={openCreate} variant="primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
                {/* Desktop Table View (Visible on sm and up) */}
                <div className="hidden sm:block">
                    <Table>
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="w-[250px] font-bold text-foreground">Nom</TableHead>
                                <TableHead className="font-semibold">Commission</TableHead>
                                <TableHead className="font-semibold text-center">Couleur</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {channels.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        Aucun canal pour le moment.
                                    </TableCell>
                                </TableRow>
                            )}
                            {channels.map((channel) => (
                                <TableRow
                                    key={channel.id}
                                    className="group transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                                >
                                    <TableCell className="font-medium text-foreground py-4">
                                        {channel.name}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {formatNumber(channel.commission, {
                                            endWith: '%',
                                        })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-block align-middle">
                                            <ColorBadge color={channel.color} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ActionButtons
                                                onEdit={() => openEdit(channel)}
                                                onDelete={() => remove(channel)}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View (Visible only on tiny screens) */}
                <div className="divide-y divide-border sm:hidden">
                    {channels.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="rounded-full bg-muted p-3 mb-4">
                                <Plus className="h-6 w-6 text-muted-foreground/60" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Aucun canal trouvé.</p>
                        </div>
                    )}

                    {channels.map((channel) => (
                        <div
                            key={channel.id}
                            className="p-5 transition-colors active:bg-muted/50"
                        >
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-1.5 text-left">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-base font-bold tracking-tight text-foreground">
                                            {channel.name}
                                        </h4>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <ColorBadge color={channel.color} />
                                    </div>
                                </div>

                                <ActionButtons
                                    onEdit={() => openEdit(channel)}
                                    onDelete={() => remove(channel)}
                                />
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <div className="flex items-center justify-between rounded-md bg-muted/50 p-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Percent className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground uppercase">Commission</span>
                                    </div>
                                    <p className="font-medium">
                                        {formatNumber(channel.commission, {
                                            endWith: '%',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* Dialog */}
            <ChannelForm
                open={open}
                channel={selected}
                onOpenChange={setOpen}
            />
        </Card>
    );
}

// ────────────────────────────────────────────────
//  Sub-components
// ────────────────────────────────────────────────
function ColorBadge({ color }: { color?: string }) {
    if (!color) return <Badge variant="outline" className="text-[10px]">N/D</Badge>;
    return (
        <Badge variant="secondary" className="gap-1.5 font-mono text-[10px]">
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} />
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
        <div className="flex justify-end gap-2 text-right">
            <Button
                variant="info"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
                title="Modifier"
            >
                <Pencil className="h-4 w-4" />
            </Button>
            <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={onDelete}
                title="Supprimer"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
