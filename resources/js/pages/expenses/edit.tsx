import { Head } from '@inertiajs/react';
import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import ExpenseForm from '@/components/Expenses/ExpenseForm';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Expense, ExpenseCategory, Unit } from '@/types';

type Props = {
    expense: Expense;
    categories: ExpenseCategory[];
    units: Unit[];
};

export default function ExpenseEdit({ expense, categories, units }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Depenses',
            href: ExpenseController.index(),
        },
        {
            title: `Modifier #${expense.id}`,
            href: ExpenseController.edit(expense.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modifier depense" />

            <ExpenseForm open onOpenChange={() => {}} expense={expense} categories={categories} units={units} />
        </AppLayout>
    );
}
