import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    Search,
    ChevronDown,
    ChevronUp,
    Edit2,
    Trash2,
    Loader2,
    User,
    Home,
} from 'lucide-react';
import { Reservation } from '@/types';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';

// --- Types ---

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    id: number;
    date: string;
    total_amount: string;
    reservation: {
        id: number;
        customer_name: string;
        accommodation_name: string;
    };
    items: OrderItem[];
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface OrdersResponse {
    data: Order[];
    meta: PaginationMeta;
}

// --- Components ---

const OrderItemsTable = ({
    items,
    onEdit,
    onDelete
}: {
    items: OrderItem[],
    onEdit: (item: OrderItem) => void,
    onDelete: (id: number) => void
}) => {
    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-100 dark:border-white/5">
                    <TableHead className="text-xs font-bold text-gray-400 uppercase">Produit</TableHead>
                    <TableHead className="text-xs font-bold text-gray-400 uppercase text-center">Qté</TableHead>
                    <TableHead className="text-xs font-bold text-gray-400 uppercase text-right">Prix Unit.</TableHead>
                    <TableHead className="text-xs font-bold text-gray-400 uppercase text-right">Total</TableHead>
                    <TableHead className="text-xs font-bold text-gray-400 uppercase text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id} className="border-gray-50 dark:border-white/5">
                        <TableCell className="font-medium text-sm">{item.product_name}</TableCell>
                        <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right text-sm">{parseFloat(item.price.toString()).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</TableCell>
                        <TableCell className="text-right font-bold text-sm text-brand-600">
                            {parseFloat(item.total.toString()).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                    onClick={() => onEdit(item)}
                                >
                                    <Edit2 size={14} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    onClick={() => onDelete(item.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const OrderCard = ({
    order,
    onEditItem,
    onDeleteItem
}: {
    order: Order,
    onEditItem: (item: OrderItem) => void,
    onDeleteItem: (id: number) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full"
        >
            <Card className="overflow-hidden border-gray-100 shadow-sm transition-all hover:shadow-md dark:border-white/5">
                <CollapsibleTrigger asChild>
                    <div className="cursor-pointer p-4 group">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg dark:text-white">
                                        Cmd #{order.id}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] font-mono border-brand-200 text-brand-600">
                                        {format(new Date(order.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <User size={14} className="text-gray-400" />
                                        <span className="font-medium">{order.reservation?.customer_name || 'Client Direct'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Home size={14} className="text-gray-400" />
                                        <span>{order.reservation?.accommodation_name || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-400 uppercase font-black">Total</span>
                                    <span className="text-xl font-black text-brand-600">
                                        {parseFloat(order.total_amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                    </span>
                                </div>
                                <div className="rounded-full bg-gray-50 p-2 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors dark:bg-white/5">
                                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="px-4 pb-4 bg-gray-50/50 dark:bg-black/20">
                        <div className="h-px w-full bg-gray-100 mb-4 dark:bg-white/5" />
                        <OrderItemsTable
                            items={order.items || []}
                            onEdit={onEditItem}
                            onDelete={onDeleteItem}
                        />
                    </div>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};

interface OrdersTabProps {
    search?: string;
    reservations?: Reservation[];
    onEditOrders?: (res: any) => void;
}

export interface OrdersTabHandle {
    sendSearch: () => void;
    isLoading: boolean;
}

export const OrdersTab = forwardRef<OrdersTabHandle, OrdersTabProps>(({ search = '' }, ref) => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    // --- Queries ---
    const { data: ordersData, isLoading, isError } = useQuery<OrdersResponse>({
        queryKey: ['orders', page],
        queryFn: async () => {
            console.log(search);
            const response = await axios.get('/api/orders', {
                params: { page, search, per_page: 8 }
            });
            return response.data;
        },
        keepPreviousData: true
    });

    useImperativeHandle(ref, () => ({
        sendSearch: () => {
            queryClient.invalidateQueries(['orders']);
        },
        isLoading,
    }));

    // --- Mutations ---
    const updateMutation = useMutation({
        mutationFn: async ({ id, quantity }: { id: number, quantity: number }) => {
            return axios.patch(`/api/order-items/${id}`, { quantity });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
            setEditingItem(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return axios.delete(`/api/order-items/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
        },
    });

    // --- Handlers ---
    const handleEditClick = (item: OrderItem) => {
        setEditingItem(item);
        setQuantity(item.quantity);
    };

    const handleUpdateQuantity = () => {
        if (editingItem && quantity > 0) {
            updateMutation.mutate({ id: editingItem.id, quantity });
        }
    };

    const handleDeleteClick = (id: number) => {
        if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-red-500">
                <p className="text-lg font-semibold">Une erreur est survenue lors du chargement des commandes</p>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries(['orders'])} className="mt-4">
                    Réessayer
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header & Stats */}
            <div className="flex items-center justify-end gap-2">
                <Badge variant="secondary" className="h-11 px-4 rounded-xl font-bold bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                    {ordersData?.meta.total || 0} Commandes
                </Badge>
            </div>

            {/* List */}
            {isLoading && !ordersData ? (
                <div className="flex h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                </div>
            ) : (
                <ScrollArea className="h-[calc(100vh-22rem)] px-1">
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
            )}

            {/* Pagination */}
            {ordersData && ordersData.meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="rounded-lg h-9 w-24"
                    >
                        Précédent
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: ordersData.meta.last_page }, (_, i) => i + 1).map((p) => (
                            <Button
                                key={p}
                                variant={page === p ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPage(p)}
                                className={`h-9 w-9 p-0 rounded-lg ${page === p ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === ordersData.meta.last_page}
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-lg h-9 w-24"
                    >
                        Suivant
                    </Button>
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Modifier la quantité</DialogTitle>
                    </DialogHeader>

                    <div className="py-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-50 dark:bg-dark-surface">
                            <span className="text-xs text-gray-400 uppercase font-bold">Produit</span>
                            <span className="font-bold text-lg">{editingItem?.product_name}</span>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-gray-500">Prix unitaire</span>
                                <span className="font-medium">{parseFloat((editingItem?.price || 0).toString()).toLocaleString('fr-FR')} €</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label htmlFor="quantity" className="font-bold">Nouvelle Quantité</Label>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl border-gray-100"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                >
                                    -
                                </Button>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="h-12 text-center text-lg font-bold rounded-xl border-gray-100"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl border-gray-100"
                                    onClick={() => setQuantity(q => q + 1)}
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50/50 border border-brand-100 dark:bg-brand-500/10 dark:border-brand-500/20 mt-2">
                            <span className="font-bold text-brand-900 dark:text-brand-400">Nouveau Total</span>
                            <span className="font-black text-xl text-brand-600">
                                {((editingItem?.price || 0) * quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                            </span>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setEditingItem(null)} className="rounded-xl h-11 flex-1">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpdateQuantity}
                            disabled={updateMutation.isLoading}
                            className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-11 flex-1 shadow-glow"
                        >
                            {updateMutation.isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Enregistrer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
});
