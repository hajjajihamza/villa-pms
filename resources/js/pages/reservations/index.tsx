import { router, useForm, Head, Link } from '@inertiajs/react';
import { Archive, Bed, CalendarCheck, CalendarClock, CalendarIcon, Filter, FilterIcon, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';
import { addDays } from 'date-fns';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';

import ReservationForm from '@/components/Reservations/ReservationForm';
import ReservationList from '@/components/Reservations/ReservationList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import type {
    Accommodation,
    BreadcrumbItem,
    Channel, Paginated,
    Reservation,
    Unit,
} from '@/types';
import { formatDateDisplay, toFormDate } from '@/lib/format-date';

export type PaginatedReservations = Paginated & {
    data: Reservation[];
};

type Props = {
    reservations: PaginatedReservations;
    channels: Channel[];
    accommodations: Accommodation[];
    activeTab: string;
    units: Unit[]
};

const TABS = [
    { label: 'Arrivées', id: 'arrivals', href: ReservationController.index().url, icon: CalendarCheck },
    { label: 'Départs', id: 'departures', href: ReservationController.departures().url, icon: CalendarClock },
    { label: 'Séjours en cours', id: 'stay-overs', href: ReservationController.stayOvers().url, icon: Bed },
    { label: 'Archive', id: 'archive', href: ReservationController.archive().url, icon: Archive },
];

export default function ReservationIndex({ reservations, channels, accommodations, activeTab, units }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

    // Filter state using Inertia useForm
    const { data, setData, get, reset, processing } = useForm({
        search: new URLSearchParams(window.location.search).get('search') || '',
        accommodation_id: new URLSearchParams(window.location.search).get('accommodation_id') || '',
        date_from: new URLSearchParams(window.location.search).get('date_from') || '',
        date_to: new URLSearchParams(window.location.search).get('date_to') || '',
    });

    const handleFilter = () => {
        get(window.location.pathname, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    }

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Reservations',
            href: ReservationController.index(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservations" />

            <section className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Reservations</h1>
                        <p className="text-sm text-muted-foreground">
                            Gerez les sejours, la validation et les visiteurs
                            supplementaires.
                        </p>
                    </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => {
                        setEditingReservation(null);
                        setFormOpen(true);
                    }}>
                        <Plus className="mr-2 size-4" />
                        Nouvelle reservation
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-3 pb-6">
                 <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Recherche</span>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Nom ou téléphone..."
                            className="pl-9 h-11 border-zinc-200 dark:border-zinc-800 shadow-sm"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Du</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-11 w-full justify-start text-left font-normal border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 shadow-sm",
                                    !data.date_from && "text-muted-foreground"
                                )}
                            >
                                {data.date_from ? formatDateDisplay(data.date_from) : "Choisir une date"}
                                <CalendarIcon className="ml-auto size-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={data.date_from ? new Date(data.date_from) : new Date()}
                                onSelect={(newDate) => {
                                    setData('date_from', newDate ? toFormDate(newDate) : '');
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Au</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-11 w-full justify-start text-left font-normal border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 shadow-sm",
                                    !data.date_to && "text-muted-foreground"
                                )}
                            >
                                {data.date_to ? formatDateDisplay(data.date_to) : "Choisir une date"}
                                <CalendarIcon className="ml-auto size-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                disabled={{ before: data.date_from ? new Date(data.date_from) : addDays(new Date(), 1) }}
                                selected={data.date_to ? new Date(data.date_to) : addDays(new Date(), 1)}
                                onSelect={(newDate) => {
                                    setData('date_to', newDate ? toFormDate(newDate) : '');
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                 <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Hébergement</span>
                    <Select
                        placeholder="Tous..."
                        isClearable
                        options={accommodations.map(acc => ({ value: acc.id.toString(), label: acc.name }))}
                        value={accommodations.map(acc => ({ value: acc.id.toString(), label: acc.name })).find(o => o.value === data.accommodation_id)}
                        onChange={(opt) => setData('accommodation_id', opt?.value || '')}
                        classNames={{
                            control: ({ isFocused }) => cn(
                                "flex h-11 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1 text-sm shadow-sm transition-colors",
                                isFocused && "border-ring ring-1 ring-ring"
                            ),
                            menu: () => "mt-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-popover text-popover-foreground shadow-md",
                            option: ({ isFocused, isSelected }) => cn(
                                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                                isFocused && "bg-accent text-accent-foreground",
                                isSelected && "bg-primary text-primary-foreground"
                            ),
                        }}
                        unstyled
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        className="h-11 px-8 text-white font-bold text-base shadow-sm"
                        onClick={handleFilter}
                        disabled={processing}
                    >
                        Afficher
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        title="Réinitialiser"
                        className="h-11 w-11 text-muted-foreground border-zinc-200 dark:border-zinc-800"
                        onClick={() => {
                            reset();
                            router.get(window.location.pathname, {}, {
                                preserveState: true,
                                replace: true,
                            });
                        }}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            </div>

                <div className="flex overflow-x-auto border-b border-border scrollbar-hide">
                    {TABS.map((tab) => (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 hover:text-primary ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground'
                            }`}
                        >
                            <tab.icon className="size-4" />
                            {tab.label}
                        </Link>
                    ))}
                </div>

                <ReservationList
                    reservations={reservations}
                    onEdit={(reservation) => {
                        setEditingReservation(reservation);
                        setFormOpen(true);
                    }}
                />

                <ReservationForm
                    open={formOpen}
                    onOpenChange={(open) => {
                        setFormOpen(open);
                        if (!open) {
                            setEditingReservation(null);
                        }
                    }}
                    reservation={editingReservation}
                    channels={channels}
                    accommodations={accommodations}
                    units={units}
                />
            </section>
        </AppLayout>
    );
}
