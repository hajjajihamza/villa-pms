import { Head } from '@inertiajs/react';
import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import ExpenseForm from '@/components/Expenses/ExpenseForm';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, ExpenseCategory, Unit } from '@/types';

type Props = {
    categories: ExpenseCategory[];
    units: Unit[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Depenses',
        href: ExpenseController.index(),
    },
    {
        title: 'Nouvelle depense',
        href: ExpenseController.create(),
    },
];

export default function ExpenseCreate({ categories, units }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle depense" />

            <ExpenseForm open onOpenChange={() => {}} categories={categories} units={units} />
        </AppLayout>
    );
}
