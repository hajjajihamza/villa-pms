import { router, useForm, Head, Link } from '@inertiajs/react';
import { Archive, Bed, CalendarCheck, CalendarClock, CalendarIcon, Clock, Filter, FilterIcon, LayoutGrid, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';
import { addDays, format } from 'date-fns';
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
    { label: 'Toutes', id: 'all', href: '/reservations', icon: LayoutGrid },
    { label: 'Arrivées', id: 'arrivals', href: '/reservations/arrivals', icon: CalendarCheck },
    { label: 'Départs', id: 'departures', href: '/reservations/departures', icon: CalendarClock },
    { label: 'En attente', id: 'requests', href: '/reservations/requests', icon: Clock },
    { label: 'Séjours en cours', id: 'stay-overs', href: '/reservations/stay-overs', icon: Bed },
    { label: 'Archive', id: 'archive', href: '/reservations/archive', icon: Archive },
];

export default function ReservationIndex({ reservations, channels, accommodations, activeTab, units }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [showFilters, setShowFilters] = useState(false);

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
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(showFilters && "bg-accent text-accent-foreground")}
                    >
                        <Filter className="mr-2 size-4" />
                        {showFilters ? 'Masquer filtres' : 'Filtrer'}
                    </Button>

                    <Button onClick={() => {
                        setEditingReservation(null);
                        setFormOpen(true);
                    }}>
                        <Plus className="mr-2 size-4" />
                        Nouvelle reservation
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Nom ou téléphone..."
                            className="pl-10 h-10 border-border/50 bg-background/50 focus:bg-background transition-colors"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                        />
                    </div>

                    <Select
                        placeholder="Hébergement..."
                        isClearable
                        options={accommodations.map(acc => ({ value: acc.id.toString(), label: acc.name }))}
                        value={accommodations.map(acc => ({ value: acc.id.toString(), label: acc.name })).find(o => o.value === data.accommodation_id)}
                        onChange={(opt) => setData('accommodation_id', opt?.value || '')}
                        classNames={{
                            control: ({ isFocused }) => cn(
                                "flex h-10 w-full rounded-md border border-border/50 bg-background/50 px-1 py-1 text-sm transition-colors",
                                isFocused && "border-ring ring-[3px] ring-ring/50 bg-background"
                            ),
                            menu: () => "mt-2 rounded-md border border-border bg-popover text-popover-foreground shadow-md",
                            option: ({ isFocused, isSelected }) => cn(
                                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                                isFocused && "bg-accent text-accent-foreground",
                                isSelected && "bg-primary text-primary-foreground"
                            ),
                            placeholder: () => "text-muted-foreground",
                            singleValue: () => "text-foreground",
                            input: () => "text-foreground",
                        }}
                        unstyled
                    />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-10 justify-start text-left font-normal border-border/50 bg-background/50 hover:bg-background transition-colors",
                                    !data.date_from && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 size-4" />
                                {data.date_from ? (
                                    formatDateDisplay(data.date_from)
                                ) : (
                                    <span>Arrivée...</span>
                                )}
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

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-10 justify-start text-left font-normal border-border/50 bg-background/50 hover:bg-background transition-colors",
                                    !data.date_to && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 size-4" />
                                {data.date_to ? (
                                    formatDateDisplay(data.date_to)
                                ) : (
                                    <span>Départ...</span>
                                )}
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

                    <div className="flex items-center gap-2">
                        <Button
                            className="flex-1 h-10"
                            onClick={handleFilter}
                            disabled={processing}
                        >
                            <FilterIcon className="mr-2 h-4 w-4" /> Filtrer
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            title="Effacer les filtres"
                            className="h-10 w-10 text-muted-foreground hover:text-foreground"
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
            )}

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
