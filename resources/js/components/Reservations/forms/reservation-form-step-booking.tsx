import { usePage } from '@inertiajs/react';
import { addDays, differenceInDays, startOfToday, isBefore, toDate } from 'date-fns';
import { useEffect, useMemo } from 'react';
import InputCounter from '@/components/input-counter';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBookingData } from '@/hooks/use-booking-data';
import type { BookingData } from '@/hooks/use-booking-data';
import { toFormDate } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';
import type { Accommodation, Reservation, Unit } from '@/types';
import { Badge } from '../../ui/badge';
import type { ReservationFormData } from './reservation-form';
import { DatePickerInput } from '@/components/date-picker_input';
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

// ────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────
const checkIsReserved = (
    units: Unit[],
    accommodation: Accommodation,
    check_in: string,
    check_out: string
): boolean => {
    return units.some(unit =>
        accommodation.units?.some(u => u.id === unit.id) &&
        unit.reserved_periods?.some(r =>
            r.check_in < check_out && r.check_out > check_in
        )
    );
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function StepBooking({ data, setData, errors, isEditing, reservation }: Props) {
    // ────────────────────────────────────────────────
    //  Hooks
    // ────────────────────────────────────────────────
    const bookingData = useBookingData().data as BookingData;

    // ────────────────────────────────────────────────
    // Props
    // ────────────────────────────────────────────────
    const user = usePage().props.auth.user;

    // ────────────────────────────────────────────────
    //  Computed
    // ────────────────────────────────────────────────
    const nights = useMemo(() => {
        if (!data.check_in || !data.check_out) return 0;
        return Math.max(0, differenceInDays(new Date(data.check_out), new Date(data.check_in)));
    }, [data.check_in, data.check_out]);

    const selectedAccommodation = useMemo(() => {
        return bookingData.accommodations.find(
            (a) => a.id === data.accommodation_id,
        );
    }, [data.accommodation_id, bookingData.accommodations]);

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleAccommodationSelect = (accommodation: Accommodation) => {
        setData({
            ...data,
            accommodation_id: accommodation.id,
            // Reset guests if they exceed new limits
            adults: Math.min(data.adults, accommodation.max_adults),
            children: Math.min(data.children, accommodation.max_children),
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
        });
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
        });
    };

    // ────────────────────────────────────────────────
    //  Effects
    // ────────────────────────────────────────────────
    useEffect(() => {
        if (bookingData.channels.length > 0 && !data.channel_id) {
            setData('channel_id', bookingData.channels[0].id);
        }
    }, []);

    useEffect(() => {
        if (selectedAccommodation && nights > 0) {
            const calculatedTotal = nights * (isEditing && reservation ? reservation.daily_price : selectedAccommodation.daily_price || 0);
            setData('total', Number(formatNumber(calculatedTotal, { thousandsSeparator: '' })));
        } else {
            setData('total', 0);
        }
    }, [selectedAccommodation, nights]);

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
                    onChange={(val) => setData('adults', String(val))}
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
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase transition-all ${isSelected
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
                    onChange={(val) => setData('advance_amount', String(val))}
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
