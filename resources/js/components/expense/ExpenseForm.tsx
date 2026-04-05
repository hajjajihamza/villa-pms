import { useForm } from '@inertiajs/react';
import { CalendarIcon, HandCoins, Save, X } from 'lucide-react';
import type { SubmitEvent } from 'react';
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

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Option = {
    value: number;
    label: string;
};

type ExpenseFormData = {
    name: string;
    amount: number;
    date: string;
    description: string;
    category_id?: number;
    unit_id?: number;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: ExpenseCategory[];
    units: Unit[];
    expense?: Expense | null;
};

// ────────────────────────────────────────────────
//  Tools
// ────────────────────────────────────────────────
const initialData: ExpenseFormData = {
    name: '',
    amount: 0,
    date: toFormDate(new Date()),
    description: '',
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function ExpenseForm({ open, onOpenChange, categories, units, expense }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const isEditing = !!expense;
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

    const { data, setData, put, post, processing, errors, reset, clearErrors } = useForm<ExpenseFormData>(initialData);
    const selectedCategory = categoryOptions.find((option) => option.value === data.category_id) ?? null;
    const selectedUnit = unitOptions.find((option) => option.value === data.unit_id) ?? null;

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const closeAndReset = () => {
        reset();
        clearErrors();
        setCategoryApiError('');
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

            setData('category_id', newOption.value);
        } catch {
            setCategoryApiError('Erreur reseau lors de la creation de categorie.');
        } finally {
            setCreatingCategory(false);
        }
    };

    // ────────────────────────────────────────────────
    //  Hooks
    // ────────────────────────────────────────────────
    useEffect(() => {
        if (!open) {
            return;
        }

        setCategoryApiError('');

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
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <ScrollArea className="px-8 max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-4 pb-2 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="expense-name">Nom</Label>
                                <Input
                                    id="expense-name"
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

                            <InputCounter
                                id="expense-amount"
                                label="Montant"
                                icon={<HandCoins className="size-4" />}
                                value={data.amount}
                                min={0}
                                step={10}
                                unit="DH"
                                error={errors.amount}
                                onChange={(value) =>
                                    setData('amount', value)
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
                                            {formatDateDisplay(
                                                data.date,
                                            ) || 'Choisir une date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
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
                                <InputError message={errors.date} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expense-category">
                                    Categorie
                                </Label>
                                <CreatableSelect
                                    inputId="expense-category"
                                    isClearable
                                    options={categoryOptions}
                                    value={selectedCategory}
                                    onChange={(option) =>
                                        setData(
                                            'category_id',
                                            option ? option.value : undefined
                                        )
                                    }
                                    onCreateOption={handleCreateCategory}
                                    isDisabled={
                                        processing || creatingCategory
                                    }
                                    placeholder="Choisir ou creer une categorie"
                                />
                                <InputError
                                    message={
                                        errors.category_id ||
                                        categoryApiError
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expense-unit">Unite</Label>
                                <Select
                                    inputId="expense-unit"
                                    isClearable
                                    options={unitOptions}
                                    value={selectedUnit}
                                    onChange={(option) =>
                                        setData(
                                            'unit_id',
                                            option ? option.value : undefined,
                                        )
                                    }
                                    placeholder="Choisir une unite (optionnel)"
                                />
                                <InputError message={errors.unit_id} />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="expense-description">
                                    Description
                                </Label>
                                <textarea
                                    id="expense-description"
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    rows={4}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Details complementaires"
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </ScrollArea>

                    {/* footer */}
                    <DialogFooter className="border-t mt-1 bg-muted/30 px-8 py-6 grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeAndReset}
                            size="lg"
                        >
                            <X className="size-4 mr-2" />
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={processing}
                            size="lg"
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
