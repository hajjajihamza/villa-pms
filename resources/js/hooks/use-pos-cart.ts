import { useState } from 'react';
import type { Product } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
export type CartItem = {
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
};

// ────────────────────────────────────────────────
//  Hook
// ────────────────────────────────────────────────
export function usePosCart() {
    // ────────────────────────────────────────────────
    //  States & Variables
    // ────────────────────────────────────────────────
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
    const [showMobileCart, setShowMobileCart] = useState(false);

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);

            // Si le produit existe déjà dans le panier, augmenter sa quantité
            if (existing) {
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            // Ajouter le produit au panier
            return [...prev, {
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                quantity: 1
            }];
        });
    };

    const updateCartQuantity = (productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product_id === productId) {
                const newQuantity = item.quantity + delta;
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const handleOrderSuccess = () => {
        setCart([]);
        setSelectedReservationId(null);
        setShowMobileCart(false);
    };

    // ────────────────────────────────────────────────
    //  Return values
    // ────────────────────────────────────────────────
    return {
        cart,
        setCart,
        selectedReservationId,
        setSelectedReservationId,
        showMobileCart,
        setShowMobileCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        cartTotal,
        cartCount,
        handleOrderSuccess,
    };
}
