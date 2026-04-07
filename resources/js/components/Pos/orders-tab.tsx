import { useState, forwardRef, useImperativeHandle } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
} from 'lucide-react';
import { Reservation } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OrderItem } from '@/types';
import OrderCard from '../order/order-card';
import EditOrderItemModal from '../order/edit-order-item-modal';
import { getOrders, type OrderResponse } from '@/api/order';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────

type Filters = {
    search?: string;
    date?: Date | string;
    accommodation_id?: number | string;
}

type Props = {
    filters?: Filters;
    reservations?: Reservation[];
    onEditOrders?: (res: any) => void;
}

export type OrdersTabHandle = {
    sendFilters: (filters: Filters) => void;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export const OrdersTab = forwardRef<OrdersTabHandle, Props>(({ filters: initialFilters = {} }, ref) => {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const [page, setPage] = useState(1);
    const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
    const [editingItem, setEditingItem] = useState<OrderItem | null>(null);

    // ────────────────────────────────────────────────
    //  Queries
    // ────────────────────────────────────────────────
    const { data: ordersData, refetch } = useQuery<OrderResponse>({
        queryKey: ['orders', page, appliedFilters],
        queryFn: async () => {
            return getOrders({ 
                page, 
                search: appliedFilters.search,
                date: appliedFilters.date?.toLocaleString(),
                accommodation_id: appliedFilters.accommodation_id
            });
        },
        suspense: true,
    });

    // ────────────────────────────────────────────────
    //  Imperative Handle
    // ────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
        sendFilters: (filters: Filters) => {
            setPage(1);
            setAppliedFilters(filters);
        }
    }));

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleEditClick = (item: OrderItem) => {
        setEditingItem(item);
    };

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <>
            {/* List */}
            <ScrollArea className="h-[calc(100vh-18rem)] px-1">
                <div className="flex flex-col gap-4 pb-10">
                    {ordersData?.data.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onEditItem={handleEditClick}
                        />
                    ))}

                    {ordersData?.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-semibold">Aucune commande trouvée</p>
                            <p className="text-sm">Essayez de modifier vos critères de recherche.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Pagination */}
            {ordersData && ordersData.meta.last_page > 1 && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
                    <div className="text-sm text-muted-foreground order-2 sm:order-1">
                        Affichage de{' '}
                        <span className="font-medium text-foreground">{ordersData.data.length}</span>{' '}
                        sur{' '}
                        <span className="font-medium text-foreground">{ordersData.meta.total}</span>{' '}
                        commandes
                        <span className="mx-2 font-light opacity-50">|</span>
                        Page {ordersData.meta.current_page} sur {ordersData.meta.last_page}
                    </div>

                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={ordersData.meta.current_page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={ordersData.meta.current_page === ordersData.meta.last_page}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}

            <EditOrderItemModal
                item={editingItem}
                open={!!editingItem}
                onOpenChange={(open) => !open && setEditingItem(null)}
                onSuccess={refetch}
            />
        </>
    );
});
