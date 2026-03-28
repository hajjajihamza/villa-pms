import React, { useState } from 'react';
import type { Product, ProductCategory, Reservation } from '@/types';
import { ProductGrid } from './product-grid';
import { CategoryTabs } from './category-tabs';
import { ReservationTabs } from './reservation-tabs';
import { CartPanel, CartItem } from './cart-panel';
import { formatNumber } from '@/lib/format-number';

type Props = {
    products: Product[];
    categories: ProductCategory[];
    reservations?: Reservation[];
    isEditingCatalog?: boolean;
    onEditProduct?: (product: Product) => void;
};

export default function PosContainer({ products, categories, reservations, isEditingCatalog, onEditProduct }: Props) {
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
    const [showMobileCart, setShowMobileCart] = useState(false);

    // Cart actions
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
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

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleOrderSuccess = () => {
        setCart([]);
        setSelectedReservationId(null);
        setShowMobileCart(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
            {/* Left side: Categories & Products */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden shadow-soft rounded-xl bg-white p-4 dark:bg-dark-card">
                {/* Reservation tabs */}
                <ReservationTabs 
                    reservations={reservations}
                    selectedReservationId={selectedReservationId}
                    onSelectReservation={setSelectedReservationId}
                />

                {/* Category tabs */}
                <CategoryTabs 
                    categories={categories}
                    activeCategoryId={activeCategoryId}
                    onSelectCategory={setActiveCategoryId}
                />

                <div className="flex-1 overflow-y-auto pr-2 pb-24 lg:pb-0 custom-scrollbar">
                    <ProductGrid 
                        products={products}
                        activeCategoryId={activeCategoryId}
                        addToCart={addToCart}
                        isEditingCatalog={isEditingCatalog}
                        onEditProduct={onEditProduct}
                    />
                </div>
            </div>

            {/* Right side: Cart */}
            <CartPanel 
                cart={cart}
                cartTotal={cartTotal}
                updateCartQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
                selectedReservationId={selectedReservationId}
                showMobileCart={showMobileCart}
                setShowMobileCart={setShowMobileCart}
                onOrderSuccess={handleOrderSuccess}
            />

            {/* Mobile Cart Toggle button */}
            {!showMobileCart && cart.length > 0 && (
                <button 
                    onClick={() => setShowMobileCart(true)}
                    className="lg:hidden fixed bottom-6 right-6 z-40 bg-black text-white px-6 py-4 rounded-full shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <div className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                    <span className="font-bold text-lg">{formatNumber(cartTotal, {endWith: 'DH'})}</span>
                    <span className="text-xs uppercase tracking-wider opacity-80">Commander</span>
                </button>
            )}
        </div>
    );
}
