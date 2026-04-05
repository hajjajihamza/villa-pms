import { useEffect, useState, type SubmitEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import CreatableSelect from 'react-select/creatable';
import InputCounter from '@/components/input-counter';
import { useForm } from '@inertiajs/react';
import type { Product, ProductCategory } from '@/types';
import ProductController from '@/actions/App/Http/Controllers/Product/ProductController';
import { useMutation } from '@tanstack/react-query';
import { createProductCategory } from '@/api/product';
import InputError from '../input-error';
import { ScrollArea } from '../ui/scroll-area';
import { Save, X } from 'lucide-react';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Partial<Product> | null;
    categories: ProductCategory[];
    onSuccess?: () => void;
}

type ProductFormData = {
    name: string;
    price: number;
    category_id?: number;
    icon: string;
}

type Option = {
    value: number;
    label: string;
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function ProductForm({
    open,
    onOpenChange,
    product,
    categories,
    onSuccess
}: Props) {
    // ────────────────────────────────────────────────
    //  States & variables
    // ────────────────────────────────────────────────
    const isEditing = !!product;

    const { data, setData, post, put, processing, errors, reset } = useForm<ProductFormData>({
        name: '',
        price: 0,
        icon: '',
        category_id: undefined,
    });

    const [categoryOptions, setCategoryOptions] = useState<Option[]>(
        categories.map((category) => ({
            value: category.id,
            label: category.name,
        })),
    );

    const selectedCategory = categoryOptions.find((option) => option.value === data.category_id);

    // ────────────────────────────────────────────────
    //  Mutation
    // ────────────────────────────────────────────────
    const createCategoryMutation = useMutation({
        mutationFn: createProductCategory,
        onSuccess: (category) => {
            setCategoryOptions((previous) => [...previous, { value: category.id, label: category.name }]);
            setData('category_id', category.id);
        },
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleCreateCategory = async (rawName: string) => {
        const name = rawName.trim();
        if (!name) return;

        await createCategoryMutation.mutateAsync({ name });
    };

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
                if (onSuccess) onSuccess();
            },
        };

        if (isEditing) {
            put(ProductController.update(product.id as number).url, options);
        } else {
            post(ProductController.store().url, options);
        }
    };

    const closeAndReset = () => {
        reset();
        onOpenChange(false);
    };

    // ────────────────────────────────────────────────
    //  Hooks
    // ────────────────────────────────────────────────
    useEffect(() => {
        if (open) {
            if (isEditing && product) {
                setData({
                    name: product.name || '',
                    price: product.price || 0,
                    category_id: product.category_id || undefined,
                    icon: product.icon || '',
                });
            }
        }
    }, [open, product]);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={closeAndReset}>
            <DialogContent className="rounded-2xl border-0 p-0 shadow-2xl sm:max-w-2xl overflow-hidden bg-background">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle>
                        {isEditing
                            ? 'Modifier un produit'
                            : 'Creer un produit'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Mettez a jour les informations de ce produit.'
                            : 'Renseignez les informations de la nouvelle depense.'}
                    </DialogDescription>
                </DialogHeader>

                {/* form */}
                <form onSubmit={handleSubmit}>
                    {/* scroll area */}
                    <ScrollArea className="px-4 lg:px-8 max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-6 py-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nom du produit</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="ex: Café Express"
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            <InputCounter
                                id="price"
                                label="Prix"
                                unit="DH"
                                value={Number(data.price) || 0}
                                min={0}
                                step={10}
                                onChange={(value) => setData('price', value)}
                                error={errors.price}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="category">Catégorie</Label>
                                <CreatableSelect
                                    inputId="category"
                                    isClearable
                                    options={categoryOptions}
                                    value={selectedCategory}
                                    onChange={(option) => setData('category_id', option?.value)}
                                    onCreateOption={handleCreateCategory}
                                    isDisabled={processing || createCategoryMutation.isPending}
                                    placeholder="Sélectionner ou créer une catégorie"
                                />
                                <InputError
                                    message={
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-expect-error
                                        errors.category_id || createCategoryMutation.error?.message
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="icon">Emoji / Icône (Optionnel)</Label>
                                <Input
                                    id="icon"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                    placeholder="ex: ☕"
                                />
                                <InputError message={errors.icon} />
                            </div>
                        </div>
                    </ScrollArea>

                    {/* footer */}
                    <DialogFooter className="grid grid-cols-1 gap-3 border-t bg-muted/30 px-8 py-6 sm:grid-cols-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeAndReset}
                            size="lg"
                            className="w-full"
                        >
                            <X className="size-4 mr-2" />
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={processing || createCategoryMutation.isPending}
                            size="lg"
                            className="w-full"
                        >
                            <Save className="size-4 mr-2" />
                            {processing ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Creer')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
