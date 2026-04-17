import React, { useEffect } from 'react';
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { formatNumber } from '@/lib/format-number';
import OrderController from '@/actions/App/Http/Controllers/Order/OrderController';
import type { CartItem } from '@/hooks/use-pos-cart';
import { DatePickerInput } from '@/components/date-picker_input';
import { toDate } from 'date-fns';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    cart: CartItem[];
    cartTotal: number;
    updateCartQuantity: (productId: number, delta: number) => void;
    removeFromCart: (productId: number) => void;
    selectedReservationId: string | null;
    showMobileCart: boolean;
    setShowMobileCart: (val: boolean) => void;
    onOrderSuccess: () => void;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function CartPanel({
    cart,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    selectedReservationId,
    showMobileCart,
    setShowMobileCart,
    onOrderSuccess,
}: Props) {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const { setData, post, processing, reset, data, errors } = useForm({
        date: new Date(),
        reservation_id: selectedReservationId,
        order_items: cart.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price
        })),
    });

    // ────────────────────────────────────────────────
    //  Effects
    // ────────────────────────────────────────────────
    useEffect(() => {
        setData('order_items', cart.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price
        })));
    }, [cart]);

    useEffect(() => {
        setData('reservation_id', selectedReservationId);
    }, [selectedReservationId]);

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleValidateOrder = () => {
        post(OrderController.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOrderSuccess();
            },
        });
    };

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <div
            className={`flex w-full shrink-0 flex-col rounded-2xl border border-gray-100 bg-white shadow-inner transition-all duration-300 lg:w-[400px] dark:border-white/5 ${showMobileCart ? 'fixed inset-0 z-50 rounded-none' : 'hidden lg:flex'}`}
        >
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 sm:gap-3 p-1 px-2">
                {/* Back button - visible on mobile/tablet, hidden on lg+ */}
                <button
                    onClick={() => setShowMobileCart(false)}
                    className="-ml-2 flex-shrink-0 p-2 text-gray-400 transition-colors hover:text-black lg:hidden dark:hover:text-white"
                    aria-label="Fermer le panier"
                >
                    <ShoppingBag size={24} />
                </button>

                {/* Title */}
                <h2 className="flex-shrink-0 text-xl font-black sm:text-2xl dark:text-white">
                    Panier
                </h2>

                {/* Spacer pushes DatePicker to the right on larger screens */}
                <div className="flex-1" />

                {/* DatePicker - full width on mobile, auto width on sm+ */}
                <div className="w-full sm:w-auto">
                    <DatePickerInput
                        id="expense-date"
                        selected={data.date}
                        onChange={(date) => setData('date', toDate(date))}
                        error={errors.date}
                        placeholder="Choisir une date"
                    />
                </div>
            </div>

            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-2 py-4">
                {cart.map((item) => (
                    <div
                        key={item.product_id}
                        className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-2 shadow-sm dark:border-white/5 dark:bg-dark-card"
                    >
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-black dark:text-white">
                                    {item.product_name}
                                </p>
                                <button
                                    onClick={() =>
                                        removeFromCart(item.product_id)
                                    }
                                    className="text-red-600 hover:text-red-500"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1 dark:bg-dark-surface">
                                    <button
                                        onClick={() =>
                                            updateCartQuantity(
                                                item.product_id,
                                                -1,
                                            )
                                        }
                                        className="p-1 transition-transform hover:scale-110 active:scale-90"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="min-w-[20px] text-center text-xs font-black">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            updateCartQuantity(
                                                item.product_id,
                                                1,
                                            )
                                        }
                                        className="p-1 transition-transform hover:scale-110 active:scale-90"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <p className="text-brand-600 text-xs font-black">
                                    {formatNumber(
                                        (item.price || 0) *
                                            (item.quantity || 1),
                                        { endWith: 'DH' },
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {cart.length === 0 && (
                    <div className="flex h-64 flex-col items-center justify-center text-gray-600 opacity-20">
                        <Plus size={48} className="mb-2" />
                        <p className="text-[10px] font-black tracking-widest uppercase">
                            Panier Vide
                        </p>
                    </div>
                )}
            </div>

            <div className="shrink-0 space-y-2 rounded-b-[2.5rem] border-t bg-white p-3 lg:border-t-0 dark:bg-dark-card">
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-2 dark:bg-dark-surface">
                    <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Total à imputer
                    </span>
                    <span className="text-2xl font-black tabular-nums dark:text-white">
                        {formatNumber(cartTotal, { endWith: 'DH' })}
                    </span>
                </div>

                <Button
                    onClick={handleValidateOrder}
                    disabled={cart.length === 0 || processing}
                    className="h-14 w-full rounded-2xl bg-black font-black text-white uppercase shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 dark:bg-white dark:text-black"
                >
                    {processing ? 'Validation...' : 'Valider la commande'}
                </Button>
            </div>
        </div>
    );
};
