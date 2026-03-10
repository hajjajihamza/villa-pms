import { useForm } from '@inertiajs/react';
import { CalendarIcon, HandCoins } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import ExpenseController from '@/actions/App/Http/Controllers/Expense/ExpenseController';
import InputCounter from '@/components/input-counter';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDateDisplay, toFormDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import type { Expense, ExpenseCategory, Unit } from '@/types';

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
    amount: string;
    date: string;
    description: string;
    category_id: string;
    unit_id: string;
};

const initialData: ExpenseFormData = {
    name: '',
    amount: '0',
    date: '',
    description: '',
    category_id: '',
    unit_id: '',
};

function parseNumber(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export default function ExpenseForm({ open, onOpenChange, categories, units, expense }: Props) {
    const [categoryApiError, setCategoryApiError] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);

    const [categoryOptions, setCategoryOptions] = useState<Option[]>(
        categories.map((category) => ({
            value: category.id,
            label: category.name,
        })),
    );

    const unitOptions = useMemo<Option[]>(
        () =>
            units.map((unit) => ({
                value: unit.id,
                label: unit.name,
            })),
        [units],
    );

    const isEditing = Boolean(expense);

    const form = useForm<ExpenseFormData>(initialData);

    useEffect(() => {
        if (!open) {
            return;
        }

        setCategoryApiError('');

        if (expense) {
            form.setData({
                name: expense.name,
                amount: String(expense.amount ?? 0),
                date: expense.date ?? '',
                description: expense.description ?? '',
                category_id: String(expense.category_id ?? ''),
                unit_id: expense.unit_id ? String(expense.unit_id) : '',
            });
            return;
        }

        form.setData(initialData);
    }, [open, expense]);

    const closeAndReset = () => {
        form.reset();
        form.clearErrors();
        setCategoryApiError('');
        onOpenChange(false);
    };

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEditing && expense) {
            form.put(ExpenseController.update(expense.id).url, {
                preserveScroll: true,
                onSuccess: closeAndReset,
            });
            return;
        }

        form.post(ExpenseController.store().url, {
            preserveScroll: true,
            onSuccess: closeAndReset,
        });
    };

    const handleCreateCategory = async (rawName: string) => {
        const name = rawName.trim();
        if (!name) return;

        setCreatingCategory(true);
        setCategoryApiError('');

        try {
            const response = await fetch('/api/expense-categories', {
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
                const message = payload?.errors?.name?.[0] ?? 'Impossible de creer cette categorie.';
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

            form.setData('category_id', String(newOption.value));
        } catch {
            setCategoryApiError('Erreur reseau lors de la creation de categorie.');
        } finally {
            setCreatingCategory(false);
        }
    };

    const selectedCategory =
        categoryOptions.find((option) => String(option.value) === form.data.category_id) ?? null;
    const selectedUnit = unitOptions.find((option) => String(option.value) === form.data.unit_id) ?? null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] rounded-2xl border-0 p-0 shadow-xl sm:max-w-3xl">
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

                <form onSubmit={onSubmit} className="space-y-4 px-6 pt-2 pb-6">
                    <ScrollArea className="max-h-[62vh] pr-2">
                        <div className="grid gap-4 pb-2 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="expense-name">Name</Label>
                                <Input
                                    id="expense-name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="Nom de la depense"
                                    className={cn(
                                        'h-11 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                        form.errors.name &&
                                            'border-destructive',
                                    )}
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <InputCounter
                                id="expense-amount"
                                label="Amount"
                                icon={<HandCoins className="size-4" />}
                                value={parseNumber(form.data.amount)}
                                min={0}
                                step={10}
                                unit="DH"
                                error={form.errors.amount}
                                onChange={(value) =>
                                    form.setData('amount', String(value))
                                }
                            />

                            <div className="space-y-2">
                                <Label htmlFor="expense-date">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="expense-date"
                                            type="button"
                                            variant="outline"
                                            className="h-11 w-full justify-start rounded-xl bg-background/90 text-left font-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDateDisplay(form.data.date) || 'Choisir une date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={
                                                form.data.date
                                                    ? new Date(
                                                          `${form.data.date}T00:00:00`,
                                                      )
                                                    : undefined
                                            }
                                            onSelect={(date) => {
                                                form.setData(
                                                    'date',
                                                    toFormDate(date),
                                                );
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError message={form.errors.date} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expense-category">
                                    Category
                                </Label>
                                <CreatableSelect
                                    inputId="expense-category"
                                    isClearable
                                    options={categoryOptions}
                                    value={selectedCategory}
                                    onChange={(option) =>
                                        form.setData(
                                            'category_id',
                                            option ? String(option.value) : '',
                                        )
                                    }
                                    onCreateOption={handleCreateCategory}
                                    isDisabled={
                                        form.processing || creatingCategory
                                    }
                                    placeholder="Choisir ou creer une categorie"
                                />
                                <InputError
                                    message={
                                        form.errors.category_id ||
                                        categoryApiError
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expense-unit">Unit</Label>
                                <Select
                                    inputId="expense-unit"
                                    isClearable
                                    options={unitOptions}
                                    value={selectedUnit}
                                    onChange={(option) =>
                                        form.setData(
                                            'unit_id',
                                            option ? String(option.value) : '',
                                        )
                                    }
                                    placeholder="Choisir une unite (optionnel)"
                                />
                                <InputError message={form.errors.unit_id} />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="expense-description">
                                    Description
                                </Label>
                                <textarea
                                    id="expense-description"
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    rows={4}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Details complementaires"
                                />
                                <InputError message={form.errors.description} />
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeAndReset}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || creatingCategory}
                        >
                            {isEditing ? 'Mettre a jour' : 'Creer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
