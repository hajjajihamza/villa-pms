import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import CreatableSelect from 'react-select/creatable';
import InputCounter from '@/components/input-counter';
import { useForm } from '@inertiajs/react';
import type { Product, ProductCategory } from '@/types';
import ProductController from '@/actions/App/Http/Controllers/Product/ProductController';

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Partial<Product> | null;
    categories: ProductCategory[];
    onSuccess?: () => void;
}

type Option = {
    value: number;
    label: string;
};

export const ProductForm: React.FC<ProductFormProps> = ({
    open,
    onOpenChange,
    product,
    categories,
    onSuccess
}) => {
    const isEditing = !!product?.id;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        price: '',
        category_id: '',
        icon: '',
    });

    const [categoryApiError, setCategoryApiError] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);

    const [categoryOptions, setCategoryOptions] = useState<Option[]>(
        categories.map((category) => ({
            value: category.id,
            label: category.name,
        })),
    );

    const handleCreateCategory = async (rawName: string) => {
        const name = rawName.trim();
        if (!name) return;

        setCreatingCategory(true);
        setCategoryApiError('');

        try {
            const response = await fetch('/api/product-categories', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ name }),
            });

            const payload = await response.json();

            if (!response.ok) {
                const message = payload?.errors?.name?.[0] ?? 'Impossible de créer cette catégorie.';
                setCategoryApiError(message);
                return;
            }

            const newOption: Option = {
                value: payload.id,
                label: payload.name,
            };

            setCategoryOptions((previous) => {
                const exists = previous.some((option) => option.value === newOption.value);
                return exists ? previous : [...previous, newOption];
            });

            setData('category_id', String(newOption.value));
        } catch {
            setCategoryApiError('Erreur réseau lors de la création de la catégorie.');
        } finally {
            setCreatingCategory(false);
        }
    };

    const selectedCategory = categoryOptions.find((option) => String(option.value) === data.category_id) ?? null;

    useEffect(() => {
        if (open) {
            if (product) {
                setData({
                    name: product.name || '',
                    price: product.price ? product.price.toString() : '',
                    category_id: product.category_id ? product.category_id.toString() : '',
                    icon: product.icon || '',
                });
            } else {
                reset();
            }
        }
    }, [open, product]);

    const handleSubmit = (e: React.FormEvent) => {
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

    const handleClose = () => {
        reset();
        setCategoryApiError('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Modifier le Produit' : 'Nouveau Produit'}</DialogTitle>
                        <DialogDescription>
                            Remplissez les détails du produit pour le point de vente.
                        </DialogDescription>
                    </DialogHeader>
                    
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
                            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                        </div>

                        <InputCounter
                            id="price"
                            label="Prix"
                            unit="DH"
                            value={Number(data.price) || 0}
                            min={0}
                            step={10}
                            onChange={(value) => setData('price', String(value))}
                            error={errors.price}
                        />

                        <div className="grid gap-2">
                            <Label htmlFor="category">Catégorie</Label>
                            <CreatableSelect
                                inputId="category"
                                isClearable
                                options={categoryOptions}
                                value={selectedCategory}
                                onChange={(option) => setData('category_id', option ? String(option.value) : '')}
                                onCreateOption={handleCreateCategory}
                                isDisabled={processing || creatingCategory}
                                placeholder="Sélectionner ou créer une catégorie"
                            />
                            {(errors.category_id || categoryApiError) && (
                                <p className="text-xs text-rose-500">
                                    {errors.category_id || categoryApiError}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="icon">Emoji / Icône (Optionnel)</Label>
                            <Input
                                id="icon"
                                value={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                                placeholder="ex: ☕"
                            />
                            {errors.icon && <p className="text-xs text-rose-500">{errors.icon}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing || creatingCategory}>
                            {processing ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
