import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Save, X } from 'lucide-react';
import { OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { updateOrderItem } from '@/api/order';
import InputCounter from '../input-counter';
import { formatNumber } from '@/lib/format-number';
import { ScrollArea } from '../ui/scroll-area';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    item: OrderItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function EditOrderItemModal({ item, open, onOpenChange, onSuccess }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const [quantity, setQuantity] = useState<number>(1);

    // ────────────────────────────────────────────────
    //  Effects
    // ────────────────────────────────────────────────
    useEffect(() => {
        if (item) {
            setQuantity(item.quantity);
        }
    }, [item]);

    // ────────────────────────────────────────────────
    //  Mutations
    // ────────────────────────────────────────────────
    const updateMutation = useMutation({
        mutationFn: async () => {
            await updateOrderItem(item?.id as number, quantity);
        },
        onSuccess: () => {
            if (onSuccess) onSuccess();
            onOpenChange(false);
        },
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleUpdateQuantity = async () => {
        if (item && quantity > 0) {
            await updateMutation.mutateAsync();
        }
    };

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl border-0 p-0 shadow-2xl max-w-md overflow-hidden bg-background p-2">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle className="text-xl font-bold">Modifier la quantité</DialogTitle>
                </DialogHeader>

                {/* scroll area */}
                <ScrollArea className="px-2 max-h-[60vh] overflow-y-auto">
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-50 dark:bg-dark-surface">
                        <span className="text-xs text-gray-400 uppercase font-bold">Produit</span>
                        <span className="font-bold text-lg">{item?.product_name}</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500">Prix unitaire</span>
                            <span className="font-medium">
                                {formatNumber(item?.price || 0, { endWith: 'DH' })}
                            </span>
                        </div>
                    </div>

                    <InputCounter
                        id="quantity"
                        label="Nouvelle Quantité"
                        value={quantity}
                        min={1}
                        step={1}
                        unit=""
                        onChange={(value) =>
                            setQuantity(value)
                        }
                    />

                    <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50/50 border border-brand-100 dark:bg-brand-500/10 dark:border-brand-500/20 mt-2">
                        <span className="font-bold text-brand-900 dark:text-brand-400">Nouveau Total</span>
                        <span className="font-black text-xl text-brand-600">
                            {formatNumber((item?.price || 0) * quantity, { endWith: 'DH' })}
                        </span>
                    </div>
                </ScrollArea>

                {/* footer */}
                <DialogFooter className="grid grid-cols-1 gap-3 border-t bg-muted/30 py-6 sm:grid-cols-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        size="lg"
                        className="w-full"
                    >
                        <X className="size-4 mr-2" />
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={updateMutation.isPending}
                        size="lg"
                        className="w-full"
                        onClick={handleUpdateQuantity}
                    >
                        <Save className="size-4 mr-2" />
                        {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
