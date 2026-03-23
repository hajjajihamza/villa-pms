import { usePage } from '@inertiajs/react';
import { addDays, differenceInDays, startOfToday, isBefore } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import InputCounter from '@/components/input-counter';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingData } from '@/hooks/use-booking-data';
import { formatDateDisplay, toFormDate } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';
import { cn } from '@/lib/utils';
import type { Accommodation, Unit } from '@/types';
import { Badge } from '../ui/badge';
import { useReservation } from './ReservationContext';

export function StepBookingSkeleton() {
    return (
        <div className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>

            <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="mt-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <div className="mt-1 flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded-lg" />
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
        </div>
    );
}

const checkIsReserved = (
    unites: Unit[],
    accommodation: Accommodation,
    check_in: string,
    check_out: string,
) => {
    let isReserved = false;
    unites.forEach((unit) => {
        if (accommodation.units?.some((u: Unit) => u.id === unit.id)) {
            if (
                unit.reserved_periods?.some(
                    (r: any) => r.check_in < check_out && r.check_out > check_in,
                )
            ) {
                isReserved = true;
            }
        }
    });

    return isReserved;
};

export default function StepBooking() {
    const {
        form: { data, setData, errors },
        isEditing,
        reservation,
    } = useReservation();

    const { data: bookingData } = useBookingData();

    if (!bookingData) return null; // Fallback for TS, though Suspense handles this

    const user = usePage().props.auth.user;

    const nights = useMemo(() => {
        if (!data.check_in || !data.check_out) return 0;
        return Math.max(
            0,
            differenceInDays(new Date(data.check_out), new Date(data.check_in)),
        );
    }, [data.check_in, data.check_out]);

    const selectedAccommodation = useMemo(() => {
        return bookingData.accommodations.find(
            (a) => a.id === data.accommodation_id,
        );
    }, [data.accommodation_id, bookingData.accommodations]);

    // Auto-calculate total price
    useEffect(() => {
        if (selectedAccommodation && nights > 0) {
            const calculatedTotal =
                nights *
                (isEditing && reservation
                    ? reservation.daily_price
                    : selectedAccommodation.daily_price || 0);
            setData(
                'total' as any,
                Number(
                    formatNumber(calculatedTotal, { thousandsSeparator: '' }),
                ) as any,
            );
        } else {
            setData('total' as any, 0 as any);
        }
    }, [selectedAccommodation, nights]);

    const handleAccommodationSelect = (accommodation: Accommodation) => {
        setData({
            ...data,
            accommodation_id: accommodation.id,
            // Reset guests if they exceed new limits
            adults: Math.min(Number(data.adults), accommodation.max_adults),
            children: Math.min(
                Number(data.children),
                accommodation.max_children,
            ),
        });
    };

    const handleCheckInSelect = (date?: Date) => {
        const check_in = toFormDate(date);
        const minCheckOutDate = toFormDate(addDays(check_in, 1));

        setData({
            ...data,
            check_in: toFormDate(date),
            check_out: isBefore(check_in, data.check_out)
                ? data.check_out
                : minCheckOutDate,
            accommodation_id:
                selectedAccommodation &&
                !isEditing &&
                checkIsReserved(
                    bookingData.units,
                    selectedAccommodation,
                    check_in,
                    data.check_out,
                )
                    ? null
                    : data.accommodation_id,
        } as any);
    };

    const handleCheckOutSelect = (date?: Date) => {
        setData({
            ...data,
            check_out: toFormDate(date),
            accommodation_id:
                selectedAccommodation &&
                !isEditing &&
                checkIsReserved(
                    bookingData.units,
                    selectedAccommodation,
                    data.check_in,
                    toFormDate(date),
                )
                    ? null
                    : data.accommodation_id,
        } as any);
    };

    return (
        <div className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Arrivée</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-2 w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formatDateDisplay(data.check_in) ||
                                    'Choisir la date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                disabled={
                                    isEditing && user.is_admin
                                        ? undefined
                                        : { before: startOfToday() }
                                }
                                selected={
                                    data.check_in
                                        ? new Date(data.check_in)
                                        : undefined
                                }
                                onSelect={handleCheckInSelect}
                            />
                        </PopoverContent>
                    </Popover>
                    <InputError message={errors.check_in} />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                        <div className="flex items-center gap-2">Départ</div>
                        {nights > 0 && (
                            <Badge variant="secondary">
                                {nights} {nights > 1 ? 'nuits' : 'nuit'}
                            </Badge>
                        )}
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formatDateDisplay(data.check_out) ||
                                    'Choisir la date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                disabled={
                                    data.check_in
                                        ? { before: addDays(data.check_in, 1) }
                                        : { before: new Date() }
                                }
                                selected={
                                    data.check_out
                                        ? new Date(data.check_out)
                                        : undefined
                                }
                                onSelect={handleCheckOutSelect}
                            />
                        </PopoverContent>
                    </Popover>
                    <InputError message={errors.check_out} />
                </div>
            </div>

            <div className="space-y-3">
                <Label>Hébergement</Label>
                <div className="mt-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {bookingData.accommodations.map((accommodation) => {
                        const isSelected =
                            data.accommodation_id === accommodation.id;
                        const isReserved = checkIsReserved(
                            bookingData.units,
                            accommodation,
                            data.check_in,
                            data.check_out,
                        );
                        return (
                            <button
                                key={accommodation.id}
                                type="button"
                                disabled={isReserved}
                                onClick={() =>
                                    handleAccommodationSelect(accommodation)
                                }
                                className={cn(
                                    'flex flex-col gap-1 rounded-xl border p-3 text-left transition-all',
                                    isSelected
                                        ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary'
                                        : isReserved
                                          ? 'cursor-not-allowed border-gray-50 bg-gray-50/50 opacity-40'
                                          : 'border-border hover:border-primary/40',
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-4 w-4 rounded-full"
                                        style={{
                                            backgroundColor:
                                                accommodation.color,
                                        }}
                                    />
                                    <span className="text-sm font-semibold">
                                        {accommodation.name}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {formatNumber(accommodation.daily_price, {
                                        endWith: 'DH',
                                    })}{' '}
                                    / night
                                </span>
                            </button>
                        );
                    })}
                </div>
                <InputError message={errors.accommodation_id} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <InputCounter
                    label={`Adultes`}
                    value={Number(data.adults)}
                    min={1}
                    max={selectedAccommodation?.max_adults}
                    onChange={(val) => setData('adults', val)}
                    error={errors.adults}
                />
                <InputCounter
                    label={`Enfants`}
                    value={data.children}
                    min={0}
                    max={selectedAccommodation?.max_children}
                    onChange={(val) => setData('children', val)}
                    error={errors.children}
                />
            </div>

            <div className="space-y-3">
                <Label>Source</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                    {bookingData.channels.map((chan) => {
                        const isSelected = data.channel_id === chan.id;
                        return (
                            <Button
                                key={chan.id}
                                type="button"
                                onClick={() => setData('channel_id', chan.id)}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase transition-all ${
                                    isSelected
                                        ? 'border-transparent text-white shadow-sm'
                                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-white/5 dark:bg-dark-surface'
                                } `}
                                style={
                                    isSelected
                                        ? { backgroundColor: chan.color }
                                        : {}
                                }
                            >
                                <div
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{
                                        backgroundColor: isSelected
                                            ? 'white'
                                            : chan.color,
                                    }}
                                />
                                {chan.name}
                            </Button>
                        );
                    })}
                </div>
                <InputError message={errors.channel_id} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <InputCounter
                    label={`Avance`}
                    value={Number(data.advance_amount)}
                    min={0}
                    step={50}
                    unit="DH"
                    max={Number(data.total)}
                    onChange={(val) => setData('advance_amount', val)}
                    error={errors.advance_amount}
                />

                <InputCounter
                    label={`Montant total`}
                    value={Number(
                        formatNumber(data.total, { thousandsSeparator: '' }),
                    )}
                    min={0}
                    step={50}
                    unit="DH"
                    onChange={(val) =>
                        setData(
                            'total',
                            Number(
                                formatNumber(val, { thousandsSeparator: '' }),
                            ),
                        )
                    }
                    error={errors.total}
                />
            </div>
        </div>
    );
}
