import { router, useForm } from '@inertiajs/react';
import { addDays } from 'date-fns';
import { CalendarIcon, Filter, Search, X } from 'lucide-react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { formatDateDisplay, toFormDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import type { Accommodation } from '@/types';

type Props = {
    accommodations: Accommodation[];
};

export default function ReservationFilters({ accommodations }: Props) {
    // on utilise URLSearchParams pour récupérer les paramètres de la requête
    const urlParams = new URLSearchParams(window.location.search);

    // formulaire de filtrage on utilise useForm de inertiajs
    const { data, setData, get, reset, processing } = useForm({
        search: urlParams.get('search') || '', // recherche par nom ou téléphone
        accommodation_id: urlParams.get('accommodation_id') || '', // recherche par hébergement
        date_from: urlParams.get('date_from') || '', // recherche par date d'arrivée
        date_to: urlParams.get('date_to') || '', // recherche par date de départ
    });

    // on transforme les hébergements en options pour react-select
    const options = accommodations.map((acc) => ({
        value: acc.id.toString(),
        label: acc.name,
    }));

    // envoie les données du formulaire au serveur sur le lien actuel
    const handleFilter = () => {
        get(window.location.pathname, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex flex-wrap items-end gap-3 pb-6">
            {/* le champ de recherche par nom ou téléphone */}
            <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Recherche
                </span>
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Nom ou téléphone..."
                        className="h-11 border-zinc-200 pl-9 shadow-sm dark:border-zinc-800"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                    />
                </div>
            </div>

            {/* le champ de recherche par date d'arrivée */}
            <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Du
                </span>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'h-11 w-full justify-start border-zinc-200 bg-white px-4 text-left font-normal shadow-sm dark:border-zinc-800 dark:bg-zinc-950',
                                !data.date_from && 'text-muted-foreground',
                            )}
                        >
                            {data.date_from
                                ? formatDateDisplay(data.date_from)
                                : 'Choisir une date'}
                            <CalendarIcon className="ml-auto size-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={
                                data.date_from
                                    ? new Date(data.date_from)
                                    : new Date()
                            }
                            onSelect={(newDate) => {
                                setData(
                                    'date_from',
                                    newDate ? toFormDate(newDate) : '',
                                );
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* le champ de recherche par date de départ */}
            <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Au
                </span>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'h-11 w-full justify-start border-zinc-200 bg-white px-4 text-left font-normal shadow-sm dark:border-zinc-800 dark:bg-zinc-950',
                                !data.date_to && 'text-muted-foreground',
                            )}
                        >
                            {data.date_to
                                ? formatDateDisplay(data.date_to)
                                : 'Choisir une date'}
                            <CalendarIcon className="ml-auto size-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            disabled={{
                                before: addDays(
                                    data.date_from
                                        ? data.date_from
                                        : new Date(),
                                    1,
                                ),
                            }}
                            selected={
                                data.date_to
                                    ? new Date(data.date_to)
                                    : addDays(new Date(), 1)
                            }
                            onSelect={(newDate) => {
                                setData(
                                    'date_to',
                                    newDate ? toFormDate(newDate) : '',
                                );
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* le champ de recherche par hébergement */}
            <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Hébergement
                </span>
                <Select
                    placeholder="Tous..."
                    isClearable
                    options={options}
                    value={options.find(
                        (o) => o.value === data.accommodation_id,
                    )}
                    onChange={(opt) =>
                        setData('accommodation_id', opt?.value || '')
                    }
                    classNames={{
                        control: ({ isFocused }) =>
                            cn(
                                'flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950',
                                isFocused && 'border-ring ring-1 ring-ring',
                            ),
                        menu: () =>
                            'mt-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-popover text-popover-foreground shadow-md',
                        option: ({ isFocused, isSelected }) =>
                            cn(
                                'relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none',
                                isFocused && 'bg-accent text-accent-foreground',
                                isSelected &&
                                    'bg-primary text-primary-foreground',
                            ),
                    }}
                    unstyled
                />
            </div>

            {/* les bouton de filtrage */}
            <div className="flex items-center gap-2">
                {/* le bouton de filtrage */}
                <Button
                    className="h-11 px-8 text-base font-bold text-white shadow-sm"
                    onClick={handleFilter}
                    disabled={processing}
                >
                    <Filter className="mr-1 size-4" />
                    Filtrer
                </Button>

                {/* le bouton de réinitialisation */}
                <Button
                    variant="outline"
                    size="icon"
                    title="Réinitialiser"
                    className="h-11 w-11 border-zinc-200 text-muted-foreground dark:border-zinc-800"
                    onClick={() => {
                        reset();
                        router.get(
                            window.location.pathname,
                            {},
                            {
                                preserveState: true,
                                replace: true,
                            },
                        );
                    }}
                >
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}
