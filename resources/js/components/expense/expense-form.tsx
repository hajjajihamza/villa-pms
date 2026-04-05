import { useForm } from '@inertiajs/react';
import { useMutation } from '@tanstack/react-query';
import { Save, X } from 'lucide-react';
import type { SubmitEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import ExpenseController from '@/actions/App/Http/Controllers/Expense/ExpenseController';
import { createExpenseCategory } from '@/api/expense-category';
import InputCounter from '@/components/input-counter';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toFormDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import type { Expense, ExpenseCategory, Unit } from '@/types';
import { DatePickerInput } from '@/components/date-picker_input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Option = {
    value: number;
    label: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: ExpenseCategory[];
    units: Unit[];
    expense?: Expense | null;
};

type ExpenseFormData = {
    name: string;
    amount: number;
    date: string;
    description: string;
    category_id?: number;
    unit_id?: number;
};

// ────────────────────────────────────────────────
//  Tools
// ────────────────────────────────────────────────
const initialData: ExpenseFormData = {
    name: '',
    amount: 0,
    date: toFormDate(new Date()),
    description: '',
    category_id: undefined,
    unit_id: undefined,
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function ExpenseForm({ open, onOpenChange, categories, units, expense }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const isEditing = !!expense;

    // Categories options
    const [categoryOptions, setCategoryOptions] = useState<Option[]>(
        categories.map((category) => ({
            value: category.id,
            label: category.name,
        })),
    );

    // Units options
    const unitOptions = useMemo<Option[]>(
        () =>
            units.map((unit) => ({
                value: unit.id,
                label: unit.name,
            })),
        [units],
    );

    // Form data
    const { data, setData, put, post, processing, errors, reset, clearErrors } = useForm<ExpenseFormData>(initialData);

    const selectedCategory = categoryOptions.find((option) => option.value === data.category_id);
    const selectedUnit = unitOptions.find((option) => option.value === data.unit_id);

    // ────────────────────────────────────────────────
    //  Mutation
    // ────────────────────────────────────────────────
    const createCategoryMutation = useMutation({
        mutationFn: createExpenseCategory,
        onSuccess: (category) => {
            setCategoryOptions((previous) => [...previous, { value: category.id, label: category.name }]);
            setData('category_id', category.id);
        },
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const closeAndReset = () => {
        reset();
        clearErrors();
        onOpenChange(false);
    };

    const onSubmit = (event: SubmitEvent) => {
        event.preventDefault();

        if (isEditing && expense) {
            put(ExpenseController.update(expense.id).url, {
                preserveScroll: true,
                onSuccess: closeAndReset,
            });
            return;
        }

        post(ExpenseController.store().url, {
            preserveScroll: true,
            onSuccess: closeAndReset,
        });
    };

    const handleCreateCategory = async (rawName: string) => {
        const name = rawName.trim();
        if (!name) return;

        await createCategoryMutation.mutateAsync({ name });
    };

    // ────────────────────────────────────────────────
    //  Hooks
    // ────────────────────────────────────────────────
    useEffect(() => {
        if (!open) {
            return;
        }

        if (isEditing && expense) {
            setData({
                name: expense.name,
                amount: expense.amount ?? 0,
                date: expense.date ?? toFormDate(new Date()),
                description: expense.description ?? '',
                category_id: expense.category_id ?? undefined,
                unit_id: expense.unit_id ?? undefined,
            });
        }
    }, [open, expense]);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={closeAndReset}>
            <DialogContent className="rounded-2xl border-0 p-0 shadow-2xl sm:max-w-2xl overflow-hidden bg-background">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle>
                        {isEditing
                            ? 'Modifier une depense'
                            : 'Creer une depense'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Mettez a jour les informations de cette depense.'
                            : 'Renseignez les informations de la nouvelle depense.'}
                    </DialogDescription>
                </DialogHeader>

                {/* form */}
                <form onSubmit={onSubmit} className="flex flex-col">
                    {/* scroll area */}
                    <ScrollArea className="px-4 lg:px-8 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-12 sm:gap-x-6 sm:gap-y-5">
                            <div className="space-y-2 sm:col-span-12">
                                <Label htmlFor="expense-name">Nom</Label>
                                <Input
                                    id="expense-name"
                                    autoFocus
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="Nom de la depense"
                                    className={cn(
                                        'h-11 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                        errors.name &&
                                        'border-destructive',
                                    )}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="sm:col-span-6">
                                <InputCounter
                                    id="expense-amount"
                                    label="Montant"
                                    value={data.amount}
                                    min={0}
                                    step={10}
                                    unit="DH"
                                    error={errors.amount}
                                    onChange={(value) =>
                                        setData('amount', value)
                                    }
                                />
                            </div>

                            <div className="sm:col-span-6">
                                <DatePickerInput
                                    id="expense-date"
                                    label="Date"
                                    defaultValue={data.date}
                                    onChange={(date) => setData('date', date)}
                                    error={errors.date}
                                    placeholder="Choisir une date"
                                />
                            </div>

                            <div className="sm:col-span-7">
                                <Label htmlFor="expense-category">
                                    Categorie
                                </Label>
                                <CreatableSelect
                                    inputId="expense-category"
                                    isClearable
                                    className="mt-1"
                                    options={categoryOptions}
                                    value={selectedCategory}
                                    onChange={(option) => setData('category_id', option?.value)}
                                    onCreateOption={handleCreateCategory}
                                    isDisabled={
                                        processing || createCategoryMutation.isPending
                                    }
                                    placeholder="Choisir ou creer une categorie"
                                />
                                <InputError
                                    message={
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-expect-error
                                        errors.category_id || createCategoryMutation.error?.message
                                    }
                                />
                            </div>

                            <div className="sm:col-span-5">
                                <Label htmlFor="expense-unit">Unite</Label>
                                <Select
                                    inputId="expense-unit"
                                    isClearable
                                    className="mt-1"
                                    options={unitOptions}
                                    value={selectedUnit}
                                    onChange={(option) => setData('unit_id', option?.value)}
                                    placeholder="Choisir une unite"
                                />
                                <InputError message={errors.unit_id} />
                            </div>

                            <div className="sm:col-span-12">
                                <Label htmlFor="expense-description">
                                    Description
                                </Label>
                                <Textarea
                                    id="expense-description"
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    rows={4}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Details complementaires"
                                />
                                <InputError message={errors.description} />
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
}
