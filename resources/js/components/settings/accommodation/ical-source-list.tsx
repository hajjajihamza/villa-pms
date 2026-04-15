import { router } from '@inertiajs/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Globe, Link2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Channel, IcalSource } from '@/types/models';
import { getIcalSources } from '@/api/ical-source';
import { Suspense, useState } from 'react';
import IcalSourceController from '@/actions/App/Http/Controllers/Settings/IcalSourceController';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import IcalSourceForm from './ical-source-form';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accommodationId: number;
    channels: Channel[];
};

// ────────────────────────────────────────────────
//  Sub Component
// ────────────────────────────────────────────────
export default function IcalSourceList({ open, onOpenChange, accommodationId, channels }: Props) {
    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-0 p-0 shadow-2xl sm:max-w-2xl overflow-hidden bg-background">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <span>Sources iCal</span>
                    </DialogTitle>
                    <DialogDescription>
                        Gérez les synchronisations iCal pour cet hébergement.
                    </DialogDescription>
                </DialogHeader>
                <Suspense fallback={<ICalSourcesSkeleton />}>
                    <IcalSourceContent accommodationId={accommodationId} channels={channels} />
                </Suspense>
            </DialogContent>
        </Dialog>
    );
}

// ────────────────────────────────────────────────
//  Sub Components
// ────────────────────────────────────────────────
function IcalSourceContent({ accommodationId, channels }: { accommodationId: number, channels: Channel[] }) {
    // ────────────────────────────────────────────────
    //  States & Variables
    // ────────────────────────────────────────────────
    const [isFormOpen, setIsFormOpen] = useState(false);
    const queryClient = useQueryClient();

    // ────────────────────────────────────────────────
    //  Data Fetching
    // ────────────────────────────────────────────────
    const { data: sources = [] } = useQuery<IcalSource[]>({
        queryKey: ['ical-sources', accommodationId],
        queryFn: async () => await getIcalSources(accommodationId),
        enabled: !!accommodationId, // only fetch when accommodationId is provided
        suspense: true,
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette source iCal ?')) {
            router.delete(IcalSourceController.destroy(id).url, {
                preserveScroll: true,
                onSuccess: () => {
                    queryClient.resetQueries({ queryKey: ['ical-sources', accommodationId] });
                },
            });
        }
    };

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <ScrollArea className="max-h-[60vh] p-3">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold">{isFormOpen ? 'Ajoute une source iCal' : 'Les sources iCal'}</h3>
                {!isFormOpen && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsFormOpen(true)}
                    >
                        <Plus className="mr-2" />
                        Ajouter
                    </Button>
                )}
            </div>

            {/* form */}
            {isFormOpen &&
                <IcalSourceForm
                    accommodationId={accommodationId}
                    channels={channels}
                    onCancel={() => {
                        setIsFormOpen(false);
                    }}
                />
            }

            {sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 rounded-2xl border-2 border-dashed border-muted text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                        <Globe className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Aucune source iCal</p>
                        <p className="text-xs text-muted-foreground/60">
                            Ajoutez une source pour commencer la synchronisation.
                        </p>
                    </div>
                </div>
            ) : (
                <ul className="space-y-2">
                    {sources.map((source) => (
                        <li key={source.id}>
                            <div
                                className={cn(
                                    "group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all duration-200",
                                    "hover:border-primary/40 hover:shadow-sm hover:shadow-primary/5",
                                    "sm:flex-row sm:items-center sm:justify-between"
                                )}
                            >
                                {/* Info */}
                                <div className="flex min-w-0 flex-col gap-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-foreground border-b" style={{ color: source.channel?.color ?? '#d4d4d8', borderColor: source.channel?.color ?? '#d4d4d8' }}>
                                            {source.channel?.name ?? "N/A"}
                                        </span>
                                    </div>

                                    <div className="flex min-w-0 items-center gap-1.5">
                                        <Link2 className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                                        <span className="truncate text-xs text-muted-foreground max-w-[260px] sm:max-w-[360px] lg:max-w-[480px]">
                                            {source.url}
                                        </span>
                                    </div>

                                    {source.last_sync_at && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                                            <RefreshCw className="h-3 w-3 shrink-0" />
                                            <time dateTime={source.last_sync_at}>
                                                Dernière synchro : {source.last_sync_at}
                                            </time>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className={cn("flex shrink-0 items-center gap-1.5")}>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDelete(source.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </ScrollArea>
    );
}

function ICalSourcesSkeleton() {
    return (
        <div className="p-4 sm:p-6 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    {/* Info */}
                    <div className="flex min-w-0 flex-col gap-2">
                        {/* Unit name + badge */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-28 rounded-md" />
                            <Skeleton className="h-5 w-10 rounded-md" />
                        </div>

                        {/* URL */}
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-3 w-3 rounded-sm shrink-0" />
                            <Skeleton className="h-3 w-48 sm:w-64 rounded-md" />
                        </div>

                        {/* Last sync */}
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-3 w-3 rounded-sm shrink-0" />
                            <Skeleton className="h-3 w-36 rounded-md" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
}