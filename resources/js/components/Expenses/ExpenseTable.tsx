import { router } from '@inertiajs/react';
import {
    Filter,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import {  useState } from 'react';
import ExpenseController from '@/actions/App/Http/Controllers/Expense/ExpenseController';
import type { Filters } from '@/components/Expenses/ExpenseFilter';
import ExpenseFilter from '@/components/Expenses/ExpenseFilter';
import ExpenseForm from '@/components/Expenses/ExpenseForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDateDisplay } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';
import type { Expense, ExpenseCategory, Unit } from '@/types';

type Props = {
    expenses: Expense[];
    categories: ExpenseCategory[];
    units: Unit[];
    filters: Filters;
};

export default function ExpenseTable({ expenses, categories, units, filters }: Props) {
    const [open, setOpen] = useState(false);
    const [openFilters, setOpenFilters] = useState(false);
    const [selected, setSelected] = useState<Expense | null>(null);

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

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl">
                            Liste des depenses
                        </CardTitle>
                        <CardDescription>
                            Consultez et gerez les depenses enregistrees.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpenFilters(!openFilters)}
                            className="flex-1 sm:flex-none"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            {openFilters ? 'Masquer Filtres' : 'Filtres'}
                        </Button>
                        <Button
                            onClick={openCreate}
                            className="flex-1 sm:flex-none"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter
                        </Button>
                    </div>
                </div>

                {/* Collapsible Filter Card */}
                <ExpenseFilter
                    units={units}
                    categories={categories}
                    filters={filters}
                    open={openFilters}
                    onOpenChange={setOpenFilters}
                />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Categorie</TableHead>
                            <TableHead>Unite</TableHead>
                            <TableHead>Cree par</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    Aucune depense trouvee.
                                </TableCell>
                            </TableRow>
                        )}

                        {expenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell className="font-medium">
                                    {expense.name}
                                </TableCell>
                                <TableCell>
                                    {formatNumber(expense.amount, {
                                        endWith: 'DH',
                                    })}
                                </TableCell>
                                <TableCell>
                                    {formatDateDisplay(expense.date)}
                                </TableCell>
                                <TableCell>
                                    {expense.category?.name ?? '-'}
                                </TableCell>
                                <TableCell>
                                    {expense.unit?.name ?? '-'}
                                </TableCell>
                                <TableCell>
                                    {expense.creator?.name ?? '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 text-sky-600"
                                            onClick={() => openEdit(expense)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => remove(expense)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            <ExpenseForm
                open={open}
                onOpenChange={setOpen}
                expense={selected}
                categories={categories}
                units={units}
            />
        </Card>
    );
}
