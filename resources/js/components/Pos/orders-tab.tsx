import { useState, forwardRef, useImperativeHandle } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
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

type Props = {
    search?: string;
    reservations?: Reservation[];
    onEditOrders?: (res: any) => void;
}

export type OrdersTabHandle = {
    sendSearch: (value?: string) => void;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export const OrdersTab = forwardRef<OrdersTabHandle, Props>(({ search = '' }, ref) => {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const [page, setPage] = useState(1);
    const [appliedSearch, setAppliedSearch] = useState(search);
    const [editingItem, setEditingItem] = useState<OrderItem | null>(null);

    // ────────────────────────────────────────────────
    //  Queries
    // ────────────────────────────────────────────────
    const { data: ordersData, refetch } = useQuery<OrderResponse>({
        queryKey: ['orders', page, appliedSearch],
        queryFn: async () => {
            return getOrders({ page, search: appliedSearch });
        },
        suspense: true,
    });

    useImperativeHandle(ref, () => ({
        sendSearch: (value?: string) => {
            setPage(1);
            setAppliedSearch(value ?? search);
        }
    }));

    // ────────────────────────────────────────────────
    //  Mutations
    // ────────────────────────────────────────────────


    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return axios.delete(`/api/order-items/${id}`);
        },
        onSuccess: () => {
            refetch();
        },
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleEditClick = (item: OrderItem) => {
        setEditingItem(item);
    };

    const handleDeleteClick = (id: number) => {
        if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
            deleteMutation.mutate(id);
        }
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
                            onDeleteItem={handleDeleteClick}
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
