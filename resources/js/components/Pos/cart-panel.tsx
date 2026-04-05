import React, { useEffect } from 'react';
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { formatNumber } from '@/lib/format-number';
import OrderController from '@/actions/App/Http/Controllers/Order/OrderController';
import type { CartItem } from '@/hooks/use-pos-cart';

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
    const { setData, post, processing, reset } = useForm({
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
        <div className={`w-full lg:w-[400px] bg-white rounded-2xl flex flex-col border border-gray-100 dark:border-white/5 shadow-inner transition-all duration-300 shrink-0 ${showMobileCart ? 'fixed inset-0 z-50 rounded-none' : 'hidden lg:flex'}`}>
            <div className="p-4 flex justify-between items-center bg-white dark:bg-dark-card lg:bg-transparent lg:dark:bg-transparent shrink-0 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowMobileCart(false)} className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <ShoppingBag size={24} />
                    </button>
                    <h2 className="text-2xl font-black dark:text-white">Panier</h2>
                </div>
                <ShoppingBag size={20} className="text-gray-300 hidden lg:block" />
                <button onClick={() => setShowMobileCart(false)} className="lg:hidden p-2 text-gray-400 hover:text-rose-500 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-3 py-4 no-scrollbar">
                {cart.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center bg-white dark:bg-dark-card p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="font-black text-sm dark:text-white">{item.product_name}</p>
                                <button onClick={() => removeFromCart(item.product_id)} className="text-red-600 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-surface p-1 rounded-xl">
                                    <button onClick={() => updateCartQuantity(item.product_id, -1)} className="p-1 hover:scale-110 active:scale-90 transition-transform">
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                                    <button onClick={() => updateCartQuantity(item.product_id, 1)} className="p-1 hover:scale-110 active:scale-90 transition-transform">
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <p className="text-xs font-black text-brand-600">
                                    {formatNumber((item.price || 0) * (item.quantity || 1), { endWith: 'DH' })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {cart.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-600 opacity-20">
                        <Plus size={48} className="mb-2" />
                        <p className="font-black uppercase tracking-widest text-[10px]">Panier Vide</p>
                    </div>
                )}
            </div>

            <div className="p-3 bg-white dark:bg-dark-card border-t lg:border-t-0 space-y-2 shrink-0 rounded-b-[2.5rem]">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-dark-surface p-2 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total à imputer</span>
                    <span className="text-2xl font-black tabular-nums dark:text-white">{formatNumber(cartTotal, { endWith: 'DH' })}</span>
                </div>

                <Button
                    onClick={handleValidateOrder}
                    disabled={cart.length === 0 || processing}
                    className="w-full h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {processing ? 'Validation...' : 'Valider la commande'}
                </Button>
            </div>
        </div>
    );
};
