import { router } from '@inertiajs/react';
import { Baby, Home, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import AccommodationController from '@/actions/App/Http/Controllers/Settings/AccommodationController';
import AccommodationForm from '@/components/settings/accommodation/accommodation-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/lib/format-number';
import type { Accommodation } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    accommodations: Accommodation[];
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function AccommodationTable({ accommodations }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const [open, setOpen] = useState(false); // dialog open
    const [selected, setSelected] = useState<Accommodation | null>(null); // object to edit

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
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

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Card>
            <CardHeader className='border-b'>
                <CardTitle className="text-xl">Hébergements</CardTitle>
                <CardDescription>
                    Gérez les types d'hébergement.
                </CardDescription>
                <CardAction>
                    <Button onClick={openCreate} variant="primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                {/* Desktop Table View (Visible on sm and up) */}
                <div className="hidden sm:block">
                    <Table>
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead className="w-[250px] font-bold text-foreground">Nom</TableHead>
                                <TableHead className="font-semibold">Prix (Nuit)</TableHead>
                                <TableHead className="font-semibold">Service</TableHead>
                                <TableHead className="font-semibold">Capacité</TableHead>
                                <TableHead className="font-semibold text-center">Couleur</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accommodations.map((acc) => (
                                <TableRow
                                    key={acc.id}
                                    className="group transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                                >
                                    {/* Primary Column: Bold and Darker */}
                                    <TableCell className="font-medium text-foreground py-4">
                                        {acc.name}
                                    </TableCell>

                                    {/* Pricing: Clean and consistent */}
                                    <TableCell className="font-mono text-sm">
                                        {formatNumber(acc.daily_price, { endWith: ' DH' })}
                                    </TableCell>

                                    <TableCell className="font-mono text-sm text-muted-foreground">
                                        {formatNumber(acc.service_price, { endWith: ' DH' })}
                                    </TableCell>

                                    {/* Capacity: Using Badges and Icons for scannability */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                <Users className="h-3.5 w-3.5" /> {acc.max_adults}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                <Baby className="h-3.5 w-3.5" /> {acc.max_children}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Color: Centered for balance */}
                                    <TableCell className="text-center">
                                        <div className="inline-block align-middle">
                                            <ColorBadge color={acc.color} />
                                        </div>
                                    </TableCell>

                                    {/* Actions: Highlighted on row hover */}
                                    <TableCell className="text-right">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ActionButtons
                                                onEdit={() => openEdit(acc)}
                                                onDelete={() => remove(acc)}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {accommodations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Aucun hébergement.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View (Visible only on tiny screens) */}
                <div className="divide-y divide-border sm:hidden">
                    {accommodations.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="rounded-full bg-muted p-3 mb-4">
                                <Home className="h-6 w-6 text-muted-foreground/60" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Aucun hébergement trouvé.</p>
                        </div>
                    )}

                    {accommodations.map((acc) => (
                        <div
                            key={acc.id}
                            className="p-5 transition-colors active:bg-muted/50"
                        >
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-base font-bold tracking-tight text-foreground">
                                            {acc.name}
                                        </h4>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <ColorBadge color={acc.color} />
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5" />
                                            {acc.max_adults} <span className="hidden xs:inline">Adultes</span>
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-border" />
                                        <span className="flex items-center gap-1">
                                            <Baby className="h-3.5 w-3.5" />
                                            {acc.max_children} <span className="hidden xs:inline">Enfants</span>
                                        </span>
                                    </div>
                                </div>

                                <ActionButtons
                                    onEdit={() => openEdit(acc)}
                                    onDelete={() => remove(acc)}
                                />
                            </div>

                            {/* Pricing Grid */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="rounded-md bg-muted/50 p-2 shadow-sm">
                                    <p className="text-xs text-muted-foreground uppercase">
                                        Nuitée
                                    </p>
                                    <p className="font-medium">
                                        {formatNumber(acc.daily_price, {
                                            endWith: 'DH',
                                        })}
                                    </p>
                                </div>
                                <div className="rounded-md bg-muted/50 p-2 shadow-sm">
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
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* Dialog */}
            <AccommodationForm
                open={open}
                accommodation={selected}
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

function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="flex justify-end gap-2">
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
