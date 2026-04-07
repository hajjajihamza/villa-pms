import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface EditOrderItemModalProps {
    item: OrderItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function EditOrderItemModal({ item, open, onOpenChange, onSuccess }: EditOrderItemModalProps) {
    const [quantity, setQuantity] = useState<number>(1);

    useEffect(() => {
        if (item) {
            setQuantity(item.quantity);
        }
    }, [item]);

    const updateMutation = useMutation({
        mutationFn: async ({ id, quantity }: { id: number, quantity: number }) => {
            return axios.patch(`/api/order-items/${id}`, { quantity });
        },
        onSuccess: () => {
            if (onSuccess) onSuccess();
            onOpenChange(false);
        },
    });

    const handleUpdateQuantity = () => {
        if (item && quantity > 0) {
            updateMutation.mutate({ id: item.id, quantity });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Modifier la quantité</DialogTitle>
                </DialogHeader>

                <div className="py-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-50 dark:bg-dark-surface">
                        <span className="text-xs text-gray-400 uppercase font-bold">Produit</span>
                        <span className="font-bold text-lg">{item?.product_name}</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500">Prix unitaire</span>
                            <span className="font-medium">
                                {parseFloat((item?.price || 0).toString()).toLocaleString('fr-FR')} €
                            </span>
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
                            {((item?.price || 0) * quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </span>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11 flex-1">
                        Annuler
                    </Button>
                    <Button
                        onClick={handleUpdateQuantity}
                        disabled={updateMutation.isPending}
                        className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-11 flex-1 shadow-glow"
                    >
                        {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Enregistrer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
