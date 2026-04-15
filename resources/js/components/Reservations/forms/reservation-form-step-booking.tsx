import { usePage } from '@inertiajs/react';
import { addDays, differenceInDays, startOfToday, isBefore, toDate, parseISO, isSameDay, areIntervalsOverlapping } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import InputCounter from '@/components/input-counter';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toFormDate } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';
import type { Accommodation, Channel, Reservation } from '@/types';
import { Badge } from '../../ui/badge';
import type { ReservationFormData } from './reservation-form';
import { DatePickerInput } from '@/components/date-picker_input';
import { useQuery } from '@tanstack/react-query';
import { getBookingData } from '@/api/reservation';
import { Toggle } from '@/components/ui/toggle';
import { CheckCircle2, Circle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    data: ReservationFormData;
    setData: (key: any, value?: any) => void;
    errors: any;
    isEditing: boolean;
    reservation?: Reservation | null;
};

type BookingData = {
    channels: Channel[];
    accommodations: Accommodation[];
};

// ────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────
const checkIsReserved = (
    accommodation: Accommodation,
    check_in: string,
    check_out: string,
    skip_period?: { check_in: string; check_out: string } | null,
): boolean => {
    if (!accommodation.reserved_periods) return false;
    return accommodation.reserved_periods.some(r => {
        // skip the current reservation period if we are editing
        if (skip_period) {
            if (isSameDay(r.check_in, skip_period.check_in) && isSameDay(r.check_out, skip_period.check_out)) {
                return false;
            }
        }

        return areIntervalsOverlapping(
            { start: parseISO(r.check_in), end: parseISO(r.check_out) },
            { start: parseISO(check_in), end: parseISO(check_out) }
        );
    });
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function StepBooking({ data, setData, errors, isEditing, reservation }: Props) {
    // ────────────────────────────────────────────────
    // Props
    // ────────────────────────────────────────────────
    const user = usePage().props.auth.user;
    const [max_adults, setMaxAdults] = useState<number>(0);
    const [max_children, setMaxChildren] = useState<number>(0);

    // ────────────────────────────────────────────────
    //  Query
    // ────────────────────────────────────────────────
    const { data: bookingData } = useQuery<BookingData>({
        queryKey: ['booking-data'],
        queryFn: getBookingData,
        suspense: true
    });

    if (!bookingData) {
        return;
    }

    // ────────────────────────────────────────────────
    //  Computed
    // ────────────────────────────────────────────────
    const nights = useMemo(() => {
        if (!data.check_in || !data.check_out) return 0;
        let duration = Math.max(0, differenceInDays(new Date(data.check_out), new Date(data.check_in)));
        return duration;
    }, [data.check_in, data.check_out]);

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const calculateTotalPrice = (ids?: number[]): number => {
        if (!bookingData || nights <= 0) return 0;

        const total = (ids ?? data.accommodation_ids).reduce((sum, id) => {
            const acc = bookingData.accommodations.find(a => a.id === id);

            if (!acc) return sum;

            const pricePerNight =
                isEditing && reservation
                    ? reservation.daily_price
                    : acc.daily_price;

            return sum + (pricePerNight * nights);
        }, 0);

        return Number(formatNumber(total, { thousandsSeparator: '' }));
    };

    const isSelectedAccommodation = (id: number) => {
        return data.accommodation_ids?.includes(id);
    };

    const handleAccommodationSelect = (accommodation: Accommodation) => {
        const newIds = [...data.accommodation_ids, accommodation.id];
        setData((prev: ReservationFormData) => ({
            ...prev,
            accommodation_ids: newIds,
            total: calculateTotalPrice(newIds),
        }));
    };

    const handleAccommodationDeselect = (accommodation: Accommodation) => {
        const newIds = data.accommodation_ids.filter(id => id !== accommodation.id);
        setData((prev: ReservationFormData) => ({
            ...prev,
            accommodation_ids: newIds,
            total: calculateTotalPrice(newIds),
        }));
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
        });
    };

    const handleCheckOutSelect = (date?: Date) => {
        setData({
            ...data,
            check_out: toFormDate(date),
        });
    };

    // ────────────────────────────────────────────────
    //  Effects
    // ────────────────────────────────────────────────
    // update max adults and max children
    useEffect(() => {
        let maxAdults = 1;
        let maxChildren = 0;
        data.accommodation_ids.forEach((id) => {
            const accommodation = bookingData.accommodations.find((accommodation) => accommodation.id === id);
            if (accommodation) {
                maxAdults += accommodation.max_adults;
                maxChildren += accommodation.max_children;
            }
        });

        // update max adults and max children
        setMaxAdults(maxAdults);
        setMaxChildren(maxChildren);

        // Reset guests if they exceed new limits
        setData({
            ...data,
            adults: Math.min(data.adults, maxAdults),
            children: Math.min(data.children, maxChildren),
        });
    }, [data.accommodation_ids]);

    // remove accommodation if it is reserved
    useEffect(() => {
        const accommodation_ids = !isEditing
            ? data.accommodation_ids.filter(id => {
                const accommodation = bookingData.accommodations.find(a => a.id === id);
                return accommodation && !checkIsReserved(accommodation, data.check_in, data.check_out);
            }) : data.accommodation_ids;

        setData((prev: ReservationFormData) => ({
            ...prev,
            accommodation_ids,
            total: calculateTotalPrice(),
        }));
    }, [nights]);

    // set default channel if not set
    useEffect(() => {
        if (bookingData?.channels.length > 0 && !data.channel_id) {
            setData('channel_id', bookingData.channels[0].id);
        }
    }, [bookingData]);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <div className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <DatePickerInput
                        id='check_in'
                        label='Arrivée'
                        placeholder='Choisir la date'
                        selected={data.check_in ? toDate(data.check_in) : undefined}
                        disabled={{
                            before:
                                isEditing && user.is_admin
                                    ? undefined
                                    : startOfToday(),
                        }}
                        onChange={(date) => handleCheckInSelect(date ? toDate(date) : undefined)}
                        error={errors.check_in}
                    />
                </div>
                <div className="space-y-2">
                    <DatePickerInput
                        id='check_out'
                        label={
                            <div className="flex items-center justify-between w-full">
                                Départ
                                {nights > 0 && (
                                    <Badge variant="secondary">
                                        {nights} {nights > 1 ? 'nuits' : 'nuit'}
                                    </Badge>
                                )}
                            </div>
                        }
                        placeholder='Choisir la date'
                        selected={data.check_out ? toDate(data.check_out) : undefined}
                        disabled={{
                            before: data.check_in
                                ? addDays(data.check_in, 1)
                                : new Date(),
                        }}
                        onChange={(date) => handleCheckOutSelect(date ? toDate(date) : undefined)}
                        error={errors.check_out}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <Label>Hébergement</Label>
                <div className="mt-1 grid gap-3 md:grid-cols-2">
                    {bookingData.accommodations.map((accommodation) => {
                        const isSelected = isSelectedAccommodation(accommodation.id);
                        const isReserved = checkIsReserved(accommodation, data.check_in, data.check_out, isEditing ? { check_in: reservation?.check_in as string, check_out: reservation?.check_out as string } : null);

                        return (
                            <Toggle
                                key={accommodation.id}
                                pressed={isSelected}
                                disabled={isReserved}
                                onPressedChange={(pressed) => {
                                    pressed ? handleAccommodationSelect(accommodation) : handleAccommodationDeselect(accommodation);
                                }}
                                className={cn(
                                    "w-full h-auto min-h-[4rem] justify-start p-3 rounded-xl border transition-all duration-200 ease-in-out group",
                                    isReserved
                                        ? "opacity-60 cursor-not-allowed bg-muted/20 border-border/50"
                                        : "hover:border-primary/40 hover:bg-accent/30 cursor-pointer",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                                        : "border-border bg-background"
                                )}
                            >
                                <div className="flex w-full items-center gap-3 min-w-0">
                                    {/* Color dot */}
                                    <div
                                        className={cn(
                                            "h-3.5 w-3.5 shrink-0 rounded-full shadow-sm transition-transform duration-200",
                                            isSelected ? "scale-110" : "scale-100"
                                        )}
                                        style={{ backgroundColor: accommodation.color }}
                                    />

                                    {/* Name + price */}
                                    <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                                        <span className={cn(
                                            "w-full truncate text-left text-sm transition-colors sm:flex-1",
                                            isSelected
                                                ? "font-semibold text-foreground"
                                                : "font-medium text-foreground/80"
                                        )}>
                                            {accommodation.name}
                                        </span>
                                        <span className={cn(
                                            "text-xs whitespace-nowrap transition-colors",
                                            isSelected
                                                ? "font-medium text-primary"
                                                : "text-muted-foreground"
                                        )}>
                                            {formatNumber(accommodation.daily_price, { endWith: "DH / night" })}
                                        </span>
                                    </div>

                                    {/* Status icon */}
                                    <div className="shrink-0 transition-transform duration-200 group-active:scale-95">
                                        {isReserved ? (
                                            <Ban className="h-4 w-4 text-muted-foreground/50" />
                                        ) : isSelected ? (
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/50" />
                                        )}
                                    </div>

                                </div>
                            </Toggle>
                        );
                    })}
                </div>
                <InputError message={errors.accommodation_ids} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <InputCounter
                    label={`Adultes`}
                    value={Number(data.adults)}
                    min={1}
                    max={max_adults}
                    onChange={(val) => setData('adults', val)}
                    error={errors.adults}
                />
                <InputCounter
                    label={`Enfants`}
                    value={data.children}
                    min={0}
                    max={max_children}
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
                                className={cn(
                                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wide transition-all duration-200",
                                    isSelected
                                        ? "border-transparent text-white shadow-sm"
                                        : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:border-border hover:text-foreground"
                                )}
                                style={isSelected ? { backgroundColor: chan.color } : undefined}
                            >
                                <div
                                    className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors"
                                    style={{ backgroundColor: isSelected ? 'white' : chan.color }}
                                />
                                {chan.name}
                            </Button>
                        );
                    })}
                </div>
                <InputError message={errors.channel_id} />
            </div>

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
    );
}
