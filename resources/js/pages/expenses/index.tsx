import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarIcon } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import ExpenseController from '@/actions/App/Http/Controllers/Expense/ExpenseController';
import ExpenseTable from '@/components/Expenses/ExpenseTable';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { formatDateDisplay, toFormDate } from '@/lib/format-date';
import type { BreadcrumbItem, Expense, ExpenseCategory, Unit } from '@/types';

type Filters = {
    name: string;
    category_id: string;
    unit_id: string;
    date: string;
};

type PaginatedExpenses = {
    data: Expense[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    expenses: PaginatedExpenses;
    categories: ExpenseCategory[];
    units: Unit[];
    filters: Filters;
};

export default function ExpenseIndex({ expenses, categories, units, filters }: Props) {
    const [openFilters, setOpenFilters] = useState(false);

    const { data, setData, get, processing } = useForm<Filters>({
        name: filters.name ?? '',
        category_id: filters.category_id ?? '',
        unit_id: filters.unit_id ?? '',
        date: filters.date ?? '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Depenses',
            href: ExpenseController.index(),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Depenses" />

            <section className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Depenses</h1>
                    <p className="text-sm text-muted-foreground">
                        Recherchez et gerez les depenses de la villa.
                    </p>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recherche & filtres</CardTitle>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpenFilters(!openFilters)}
                        >
                            {openFilters ? (
                                <>
                                    Masquer{' '}
                                    <ChevronUp className="ml-2 h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Afficher{' '}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardHeader>

                    {openFilters && (
                        <CardContent>
                            <form
                                onSubmit={submit}
                                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                            >
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="filter-name">Nom</Label>
                                    <Input
                                        id="filter-name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        placeholder="Nom de la depense"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="filter-category">
                                        Categorie
                                    </Label>
                                    <select
                                        id="filter-category"
                                        value={data.category_id}
                                        onChange={(event) =>
                                            setData(
                                                'category_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="">Toutes</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Unit */}
                                <div className="space-y-2">
                                    <Label htmlFor="filter-unit">Unité</Label>
                                    <select
                                        id="filter-unit"
                                        value={data.unit_id}
                                        onChange={(event) =>
                                            setData(
                                                'unit_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="">Toutes</option>
                                        {units.map((unit) => (
                                            <option
                                                key={unit.id}
                                                value={unit.id}
                                            >
                                                {unit.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="filter-date">Date</Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="filter-date"
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formatDateDisplay(data.date) ||
                                                    'Choisir une date'}
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    data.date
                                                        ? new Date(
                                                              `${data.date}T00:00:00`,
                                                          )
                                                        : undefined
                                                }
                                                onSelect={(date) => {
                                                    setData(
                                                        'date',
                                                        toFormDate(date),
                                                    );
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetFilters}
                                        disabled={processing}
                                    >
                                        Réinitialiser
                                    </Button>

                                    <Button type="submit" disabled={processing}>
                                        Filtrer
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    )}
                </Card>

                <div className="space-y-4">
                    <ExpenseTable
                        expenses={expenses.data}
                        categories={categories}
                        units={units}
                    />

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Page {expenses.current_page} sur{' '}
                            {expenses.last_page}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                disabled={!expenses.prev_page_url}
                            >
                                <Link
                                    href={expenses.prev_page_url ?? '#'}
                                    preserveScroll
                                >
                                    Precedent
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                disabled={!expenses.next_page_url}
                            >
                                <Link
                                    href={expenses.next_page_url ?? '#'}
                                    preserveScroll
                                >
                                    Suivant
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
