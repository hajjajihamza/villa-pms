import type { ProductCategory } from '@/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type CategoryTabsProps = {
    categories: ProductCategory[];
    activeCategoryId: number | null;
    onSelectCategory: (id: number | null) => void;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function CategoryTabs({ categories, activeCategoryId, onSelectCategory }: CategoryTabsProps) {
    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <ScrollArea className="w-full whitespace-nowrap rounded-lg border-b border-gray-200 pb-2">
            <div className="flex w-max space-x-2 p-1">
                <button
                    onClick={() => onSelectCategory(null)}
                    className={`flex items-center justify-center rounded-xl px-6 py-1 font-semibold text-sm transition-all border ${
                        activeCategoryId === null
                            ? 'bg-black text-white shadow-md dark:bg-white dark:text-black'
                            : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-dark-card dark:text-gray-300 dark:hover:bg-dark-surface'
                    }`}
                >
                    Tous
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        className={`flex items-center justify-center rounded-xl px-6 py-1 font-semibold text-sm transition-all border ${
                            activeCategoryId === cat.id
                                ? 'bg-black text-white shadow-md dark:bg-white dark:text-black'
                                : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-dark-card dark:text-gray-300 dark:hover:bg-dark-surface'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
};
