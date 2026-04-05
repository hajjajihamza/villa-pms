import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type PaginatedMeta = Paginated & {
    count: number;
};

type Props = {
    data: PaginatedMeta;
    label?: string;
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function Pagination({ data, label = 'éléments' }: Props) {
    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Affichage de{' '}
                <span className="font-medium text-foreground">{data.count}</span>{' '}
                sur{' '}
                <span className="font-medium text-foreground">{data.total}</span>{' '}
                {label}
                <span className="mx-2 font-light opacity-50">|</span>
                Page {data.current_page} sur {data.last_page}
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                    asChild={!!data.prev_page_url}
                    variant="outline"
                    size="sm"
                    disabled={!data.prev_page_url}
                >
                    {data.prev_page_url ? (
                        <Link href={data.prev_page_url} preserveScroll>
                            Précédent
                        </Link>
                    ) : (
                        <span>Précédent</span>
                    )}
                </Button>

                <Button
                    asChild={!!data.next_page_url}
                    variant="outline"
                    size="sm"
                    disabled={!data.next_page_url}
                >
                    {data.next_page_url ? (
                        <Link href={data.next_page_url} preserveScroll>
                            Suivant
                        </Link>
                    ) : (
                        <span>Suivant</span>
                    )}
                </Button>
            </div>
        </div>
    );
}
