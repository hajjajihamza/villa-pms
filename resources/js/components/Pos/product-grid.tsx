import React from 'react';
import { Edit2 } from 'lucide-react';
import type { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/format-number';

interface ProductGridProps {
    products: Product[];
    activeCategoryId: number | null;
    addToCart: (product: Product) => void;
    isEditingCatalog?: boolean;
    onEditProduct?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    activeCategoryId,
    addToCart,
    isEditingCatalog,
    onEditProduct,
}) => {
    // Client-side filtering
    const filteredProducts = products.filter(
        (p) => activeCategoryId === null || p.category_id === activeCategoryId
    );

    return (
        <div className="grid grid-cols-2 xs:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-32 lg:pb-6 content-start">
            {filteredProducts.map((prod) => (
                <Card
                    key={prod.id}
                    onClick={() => {
                        if (isEditingCatalog && onEditProduct) {
                            onEditProduct(prod);
                        } else {
                            addToCart(prod);
                        }
                    }}
                    className={`flex h-36 sm:h-44 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 bg-gray-50 p-1 transition-all hover:bg-white group sm:rounded-[2.5rem] dark:bg-dark-surface dark:hover:bg-gray-800 gap-3 ${
                        isEditingCatalog
                            ? 'relative border-brand-500 shadow-sm dark:shadow-brand-900/20'
                            : 'border-transparent shadow-sm hover:shadow-lg'
                    }`}
                >
                    {isEditingCatalog && (
                        <div className="absolute right-3 top-3 scale-90 rounded-full bg-brand-500 p-2 text-white shadow-lg transition-transform group-hover:scale-110">
                            <Edit2 size={12} />
                        </div>
                    )}
                    <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-white dark:bg-black flex items-center justify-center text-2xl sm:text-3xl shadow-sm my-1 group-hover:scale-110 transition-transform">
                        {prod.icon || '✨'}
                    </div>
                    <span className="mb-0.5 text-center text-[11px] font-black leading-tight text-gray-800 sm:mb-1 sm:text-sm dark:text-white">
                        {prod.name}
                    </span>
                    <span className="text-[10px] font-bold text-brand-600 sm:text-xs">
                        {formatNumber(prod.price || 0, {endWith: 'DH'})}
                    </span>
                </Card>
            ))}
            
            {filteredProducts.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-400">
                    Aucun produit trouvé dans cette catégorie.
                </div>
            )}
        </div>
    );
};
