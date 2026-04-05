import { usePage } from '@inertiajs/react';
import { LayoutGrid, List, Plus, Settings, Search, Send, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import PosController from '@/actions/App/Http/Controllers/Pos/PosController';
import PosContainer from '@/components/pos/pos-container';
import { OrdersTab, OrdersTabHandle } from '@/components/pos/orders-tab';
import ProductForm from '@/components/pos/product-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Product, ProductCategory, Reservation } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    products: Product[],
    categories: ProductCategory[],
    reservations?: Reservation[]
}

// ────────────────────────────────────────────────
//  Tools
// ────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Point de Vente',
        href: PosController.index().url,
    },
];

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function Index({ products, categories, reservations }: Props) {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const isAdmin = usePage().props.auth.user.is_admin;
    const [activeTab, setActiveTab] = useState<'pos' | 'order'>('pos');
    const [isEditingCatalog, setIsEditingCatalog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [search, setSearch] = useState('');

    const ordersTabRef = useRef<OrdersTabHandle>(null);

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleNewProduct = () => {
        setEditingProduct(null);
        setIsProductFormOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsProductFormOpen(true);
    };

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Tabs
                value={activeTab}
                onValueChange={(value) =>
                    setActiveTab(value as 'pos' | 'order')
                }
                className="flex flex-col gap-4"
            >
                {/* HEADER */}
                <div className="shadow-soft flex shrink-0 flex-col items-center justify-between gap-4 rounded-2xl bg-white p-2 sm:flex-row dark:bg-dark-card">
                    {/* LEFT: Tabs */}
                    <TabsList className="flex w-full rounded-xl bg-gray-100 p-1 sm:w-auto dark:bg-dark-surface">
                        <TabsTrigger
                            value="pos"
                            className="data-[state=active]:text-brand-600 flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-2 text-[10px] font-black text-gray-400 uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm sm:flex-none sm:text-xs data-[state=active]:dark:bg-dark-card"
                        >
                            <LayoutGrid size={16} /> Saisie
                        </TabsTrigger>

                        <TabsTrigger
                            value="order"
                            className="data-[state=active]:text-brand-600 flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-2 text-[10px] font-black text-gray-400 uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm sm:flex-none sm:text-xs data-[state=active]:dark:bg-dark-card"
                        >
                            <List size={16} /> Commandes
                        </TabsTrigger>
                    </TabsList>

                    {/* RIGHT: Actions */}
                    <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                        {activeTab === 'order' && (
                            <div className="flex items-center gap-2 flex-1 sm:flex-none">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Rechercher..."
                                        className="pl-10 h-10 rounded-xl border-gray-100 bg-gray-50/50 dark:bg-dark-surface dark:border-white/5"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button
                                    size="icon"
                                    onClick={() => {
                                        ordersTabRef.current?.sendSearch();
                                    }}
                                    disabled={ordersTabRef.current?.isLoading || !search.trim()}
                                    className="h-10 w-10 rounded-xl shadow-glow"
                                >
                                    {ordersTabRef.current?.isLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Send size={16} />
                                    )}
                                </Button>
                            </div>
                        )}

                        {activeTab === 'pos' && isAdmin && (
                            <div className="flex items-center gap-2">
                                {isEditingCatalog && (
                                    <button
                                        onClick={handleNewProduct}
                                        className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-[10px] font-black text-white uppercase shadow-glow transition-all active:scale-95 dark:bg-white dark:text-black"
                                    >
                                        <Plus size={14} />
                                        <span className="xs:inline hidden">
                                            Nouveau Produit
                                        </span>
                                    </button>
                                )}

                                <button
                                    onClick={() =>
                                        setIsEditingCatalog(!isEditingCatalog)
                                    }
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase transition-all ${isEditingCatalog
                                            ? 'bg-brand-500 text-white shadow-glow'
                                            : 'bg-gray-100 text-gray-400 hover:text-gray-600 dark:bg-dark-surface'
                                        }`}
                                >
                                    <Settings size={14} />
                                    <span className="xs:inline hidden">
                                        {isEditingCatalog
                                            ? 'Terminer Admin'
                                            : 'Gérer Catalogue'}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTENTS */}
                <div className="mt-2">
                    <TabsContent value="pos" className="mt-0 ">
                        <PosContainer
                            products={products}
                            categories={categories}
                            reservations={reservations}
                            isEditingCatalog={isEditingCatalog}
                            onEditProduct={handleEditProduct}
                        />
                    </TabsContent>
                    <TabsContent value="order" className="mt-0 shadow-soft rounded-xl bg-white p-4 dark:bg-dark-card">
                        <OrdersTab
                            ref={ordersTabRef}
                            search={search}
                            reservations={reservations}
                            onEditOrders={(res) => console.log('Edit orders for', res.id)}
                        />
                    </TabsContent>
                </div>
            </Tabs>

            {/* Product Form */}
            <ProductForm
                open={isProductFormOpen}
                onOpenChange={setIsProductFormOpen}
                product={editingProduct}
                categories={categories}
            />
        </AppLayout>
    );
}
