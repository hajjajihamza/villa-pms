import { Head, router } from '@inertiajs/react';
import { Filter, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ExpenseController from '@/actions/App/Http/Controllers/Expense/ExpenseController';
import ExpenseForm from '@/components/expense/expense-form';
import type { Filters } from '@/components/expense/expense-filter';
import ExpenseFilter from '@/components/expense/expense-filter';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { formatDateDisplay } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';
import type { BreadcrumbItem, Expense, ExpenseCategory, Paginated, Unit } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type PaginatedExpenses = Paginated & {
    data: Expense[];
};

type Props = {
    expenses: PaginatedExpenses;
    categories: ExpenseCategory[];
    units: Unit[];
    filters: Filters;
};

// ────────────────────────────────────────────────
//  Tools
// ────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Depenses',
        href: ExpenseController.index(),
    },
];

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function ExpenseIndex({ expenses, categories, units, filters }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const [open, setOpen] = useState(false); // Modal state
    const [openFilters, setOpenFilters] = useState(false); // Filters state
    const [selected, setSelected] = useState<Expense | null>(null); // object to edit
    const isMobile = useIsMobile();

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const openCreate = () => {
        setSelected(null);
        setOpen(true);
    };

    const openEdit = (expense: Expense) => {
        setSelected(expense);
        setOpen(true);
    };

    const remove = (expense: Expense) => {
        if (!confirm(`Supprimer la depense "${expense.name}" ?`)) return;

        router.delete(ExpenseController.destroy(expense.id), {
            preserveScroll: true,
        });
    };

    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────
    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            title="Depenses"
            description="Recherchez et gerez les depenses."
            action={
                <>
                    <Button
                        variant="outline"
                        onClick={() => setOpenFilters(!openFilters)}
                        className="flex-1 sm:flex-none"
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        {openFilters ? 'Masquer Filtres' : 'Filtres'}
                    </Button>
                    <Button onClick={openCreate} className="flex-1 sm:flex-none">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter
                    </Button>
                </>
            }
        >
            <Head title="Depenses" />

            {/* Collapsible Filter Card */}
            <ExpenseFilter
                units={units}
                categories={categories}
                filters={filters}
                open={openFilters}
                onOpenChange={setOpenFilters}
            />

            <div className="space-y-4">
                <Card>
                    <CardContent>
                        {/* Desktop Table (hidden on mobile) */}
                        {!isMobile && (
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead className="font-bold text-foreground">Nom</TableHead>
                                        <TableHead className="font-semibold">Montant</TableHead>
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold">Categorie</TableHead>
                                        <TableHead className="font-semibold">Unite</TableHead>
                                        <TableHead className="font-semibold">Cree par</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.data.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                Aucune depense trouvee.
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {expenses.data.map((expense) => (
                                        <TableRow
                                            key={expense.id}
                                            className="group transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                                        >
                                            <TableCell className="font-medium text-foreground py-4">
                                                {expense.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {formatNumber(expense.amount, { endWith: 'DH' })}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDateDisplay(expense.date)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {expense.category?.name ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {expense.unit?.name ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {expense.creator?.name ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ActionButtons
                                                        onEdit={() => openEdit(expense)}
                                                        onDelete={() => remove(expense)}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {/* Mobile Card View */}
                        {isMobile && (
                            <div className="divide-y divide-border">
                                {expenses.data.length === 0 && (
                                    <div className="flex flex-col items-center justify-center p-12 text-center">
                                        <div className="rounded-full bg-muted p-3 mb-4">
                                            <Filter className="h-6 w-6 text-muted-foreground/60" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Aucune depense trouvee.
                                        </p>
                                    </div>
                                )}

                                {expenses.data.map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="p-5 transition-colors active:bg-muted/50"
                                    >
                                        {/* Header row */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="space-y-1.5">
                                                <h4 className="text-base font-bold tracking-tight text-foreground">
                                                    {expense.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                                    <span>{formatDateDisplay(expense.date)}</span>
                                                    {expense.category?.name && (
                                                        <>
                                                            <span className="h-1 w-1 rounded-full bg-border" />
                                                            <span>{expense.category.name}</span>
                                                        </>
                                                    )}
                                                    {expense.creator?.name && (
                                                        <>
                                                            <span className="h-1 w-1 rounded-full bg-border" />
                                                            <span>{expense.creator.name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <ActionButtons
                                                onEdit={() => openEdit(expense)}
                                                onDelete={() => remove(expense)}
                                            />
                                        </div>

                                        {/* Info grid */}
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="rounded-md bg-muted/50 p-2 shadow-sm">
                                                <p className="text-xs text-muted-foreground uppercase">Montant</p>
                                                <p className="font-medium font-mono">
                                                    {formatNumber(expense.amount, { endWith: 'DH' })}
                                                </p>
                                            </div>
                                            <div className="rounded-md bg-muted/50 p-2 shadow-sm">
                                                <p className="text-xs text-muted-foreground uppercase">Unite</p>
                                                <p className="font-medium">{expense.unit?.name ?? '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                <Pagination
                    data={{
                        count: expenses.data.length,
                        total: expenses.total,
                        current_page: expenses.current_page,
                        last_page: expenses.last_page,
                        prev_page_url: expenses.prev_page_url,
                        next_page_url: expenses.next_page_url,
                    }}
                    label="dépenses"
                />

                {/* Dialog */}
                <ExpenseForm
                    open={open}
                    onOpenChange={setOpen}
                    expense={selected}
                    categories={categories}
                    units={units}
                />
            </div>
        </AppLayout>
    );
}

// ────────────────────────────────────────────────
//  Sub-components
// ────────────────────────────────────────────────
function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="info"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
                title="Modifier"
            >
                <Pencil className="h-4 w-4" />
            </Button>
            <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={onDelete}
                title="Supprimer"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
