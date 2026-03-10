import { Head, Link } from '@inertiajs/react';
import ExpenseController from '@/actions/App/Http/Controllers/Expense/ExpenseController';
import type { Filters } from '@/components/Expenses/ExpenseFilter';
import ExpenseTable from '@/components/Expenses/ExpenseTable';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Expense, ExpenseCategory, Unit } from '@/types';


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
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Depenses',
            href: ExpenseController.index(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Depenses" />

            <section className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Depenses</h1>
                    <p className="text-sm text-muted-foreground">
                        Recherchez et gerez les depenses.
                    </p>
                </div>

                <div className="space-y-4">
                    <ExpenseTable
                        expenses={expenses.data}
                        categories={categories}
                        units={units}
                        filters={filters}
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
