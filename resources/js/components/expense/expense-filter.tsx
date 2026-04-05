import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import type { SubmitEvent } from 'react';
import Select from 'react-select';
import ExpenseController from '@/actions/App/Http/Controllers/Expense/ExpenseController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ExpenseCategory, Unit } from '@/types';
import { DatePickerInput } from '../inputs/date-picker_input';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
export type Filters = {
    name: string;
    category_id: string;
    unit_id: string;
    date: string;
};

type Option = {
    value: number;
    label: string;
};

type Props = {
    units: Unit[];
    categories: ExpenseCategory[];
    filters: Filters;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
function ExpenseFilter({ units, categories, filters, open, onOpenChange }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const { data, setData, get, processing } = useForm<Filters>({
        name: filters.name ?? '',
        category_id: filters.category_id ?? '',
        unit_id: filters.unit_id ?? '',
        date: filters.date ?? '',
    });

    const categoryOptions = useMemo<Option[]>(
        () =>
            categories.map((category) => ({
                value: category.id,
                label: category.name,
            })),
        [categories],
    );
    const unitOptions = useMemo<Option[]>(
        () =>
            units.map((unit) => ({
                value: unit.id,
                label: unit.name,
            })),
        [units],
    );

    const selectedCategory =
        categoryOptions.find(
            (option) => String(option.value) === data.category_id,
        ) ?? null;
    const selectedUnit =
        unitOptions.find(
            (option) => String(option.value) === data.unit_id,
        ) ?? null;

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const submit = (event: SubmitEvent) => {
        event.preventDefault();

        get(ExpenseController.index().url, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const empty: Filters = {
            name: '',
            category_id: '',
            unit_id: '',
            date: '',
        };

        setData(empty);

        get(ExpenseController.index({ query: empty }).url, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Collapsible open={open} onOpenChange={onOpenChange} className="w-full">
            <CollapsibleContent className="space-y-4">
                <Card className="border-dashed bg-muted/30 my-2">
                    <CardContent>
                        <form
                            onSubmit={submit}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
                        >
                            {/* Name Filter */}
                            <div className="grid gap-2">
                                <Label htmlFor="filter-name">Nom</Label>
                                <Input
                                    id="filter-name"
                                    placeholder="Ex: Carburant..."
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                            </div>

                            {/* Category Filter - Replaced with react-select */}
                            <div className="grid gap-2">
                                <Label>Catégorie</Label>
                                <Select
                                    value={selectedCategory}
                                    onChange={(option) =>
                                        setData(
                                            'category_id',
                                            option ? String(option.value) : '',
                                        )
                                    }
                                    options={categoryOptions}
                                    placeholder="Toutes les catégories"
                                    isClearable
                                />
                            </div>

                            {/* Unit Filter */}
                            <div className="grid gap-2">
                                <Label>Unité</Label>
                                <Select
                                    value={selectedUnit}
                                    onChange={(option) =>
                                        setData(
                                            'unit_id',
                                            option ? String(option.value) : '',
                                        )
                                    }
                                    options={unitOptions}
                                    placeholder="Toutes les unités"
                                    isClearable
                                />
                            </div>

                            {/* Date Filter */}
                            <div className="grid gap-2">
                                <DatePickerInput
                                    id="expense-date"
                                    label="Date"
                                    defaultValue={data.date}
                                    onChange={(date) => setData('date', date)}
                                    placeholder="Choisir une date"
                                    className='h-10'
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 pt-2 md:col-span-2 lg:col-span-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="text-muted-foreground"
                                    disabled={processing}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Réinitialiser
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={processing}
                                >
                                    Appliquer les filtres
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </CollapsibleContent>
        </Collapsible>
    );
}

export default ExpenseFilter;
