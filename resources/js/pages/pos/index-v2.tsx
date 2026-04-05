import PosContainer from '@/components/pos/pos-container';
import type { Product, ProductCategory } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    products: Product[],
    categories: ProductCategory[]
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function IndexV2({ products, categories }: Props) {
    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <PosContainer
            products={products}
            categories={categories}
            className='h-[100vh]'
        />
    );
}
