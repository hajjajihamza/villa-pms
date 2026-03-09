import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import AccommodationController from '@/actions/App/Http/Controllers/Settings/Accommodation/AccommodationController';
import AccommodationForm from '@/components/settings/AccommodationForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/lib/format-number';
import type { Accommodation } from '@/types';

type Props = {
    accommodations: Accommodation[];
};

export default function AccommodationTable({ accommodations }: Props) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Accommodation | null>(null);

    const openCreate = () => {
        setSelected(null);
        setOpen(true);
    };

    const openEdit = (accommodation: Accommodation) => {
        setSelected(accommodation);
        setOpen(true);
    };

    const remove = (accommodation: Accommodation) => {
        if (!confirm(`Supprimer ${accommodation.name} ?`)) return;
        router.delete(AccommodationController.destroy(accommodation.id), { preserveScroll: true });
    };

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-xl">Hébergements</CardTitle>
                    <CardDescription>
                        Gérez les types d'hébergement et leur tarification.
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
                {/* Desktop Table View (Visible on sm and up) */}
                <div className="hidden sm:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Prix (Nuit)</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Capacité</TableHead>
                                <TableHead>Couleur</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accommodations.map((acc) => (
                                <TableRow key={acc.id} className="group">
                                    <TableCell className="font-semibold">
                                        {acc.name}
                                    </TableCell>
                                    <TableCell>
                                        {formatNumber(acc.daily_price, {
                                            endWith: 'DH',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        {formatNumber(acc.service_price, {
                                            endWith: 'DH',
                                        })}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {acc.max_adults} Adultes /{' '}
                                        {acc.max_children} Enfants
                                    </TableCell>
                                    <TableCell>
                                        <ColorBadge color={acc.color} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ActionButtons
                                            onEdit={() => openEdit(acc)}
                                            onDelete={() => remove(acc)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View (Visible only on tiny screens) */}
                <div className="divide-y sm:hidden">
                    {accommodations.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            Aucun hébergement.
                        </div>
                    )}
                    {accommodations.map((acc) => (
                        <div key={acc.id} className="space-y-3 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-lg font-bold">
                                        {acc.name}
                                    </h4>
                                    <div className="mt-1 flex items-center gap-2">
                                        <ColorBadge color={acc.color} />
                                    </div>
                                </div>
                                <ActionButtons
                                    onEdit={() => openEdit(acc)}
                                    onDelete={() => remove(acc)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="rounded-md bg-muted/50 p-2">
                                    <p className="text-xs text-muted-foreground uppercase">
                                        Quotidien
                                    </p>
                                    <p className="font-medium">
                                        {formatNumber(acc.daily_price, {
                                            endWith: 'DH',
                                        })}
                                    </p>
                                </div>
                                <div className="rounded-md bg-muted/50 p-2">
                                    <p className="text-xs text-muted-foreground uppercase">
                                        Service
                                    </p>
                                    <p className="font-medium">
                                        {formatNumber(acc.service_price, {
                                            endWith: 'DH',
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>
                                    {acc.max_adults} Adultes, {acc.max_children}{' '}
                                    Enfants
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            <AccommodationForm
                open={open}
                accommodation={selected}
                onOpenChange={setOpen}
            />
        </Card>
    );
}

// Sub-components for cleaner code
function ColorBadge({ color }: { color?: string }) {
    if (!color) return <Badge variant="outline" className="text-[10px]">N/D</Badge>;
    return (
        <Badge variant="secondary" className="gap-1.5 font-mono text-[10px]">
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} />
            {color}
        </Badge>
    );
}

function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-sky-600"
                onClick={onEdit}
            >
                <Pencil className="h-4 w-4" />
            </Button>
            <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={onDelete}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
