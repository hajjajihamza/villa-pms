import { usePage } from '@inertiajs/react';
import { addDays, differenceInDays, startOfToday, isBefore } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import InputCounter from '@/components/input-counter';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDateDisplay, toFormDate } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';
import { cn } from '@/lib/utils';
import type { Accommodation, Channel, Unit } from '@/types';
import { Badge } from '../ui/badge';

type Props = {
    data: any;
    setData: (key: any, value?: any) => void;
    errors: any;
    channels: Channel[];
    accommodations: Accommodation[];
    isEditing: boolean;
    units: Unit[];
};

const checkIsReserved = (unites: Unit[], accommodation: Accommodation, check_in: string, check_out: string) => {
    let isReserved = false;
    unites.map((unit) => {
        if (accommodation.units?.some((u) => u.id === unit.id)) {
            if (unit.reserved_periods?.some((r) => r.check_in < check_out && r.check_out > check_in)) {
                isReserved = true;
            }
        }
    });

    return isReserved;
};

export default function StepBooking({ data, setData, errors, channels, accommodations, isEditing, units }: Props) {
  const user = usePage().props.auth.user;

  const nights = useMemo(() => {
    if (!data.check_in || !data.check_out) return 0;
    return Math.max(0, differenceInDays(new Date(data.check_out), new Date(data.check_in)));
  }, [data.check_in, data.check_out]);

  const selectedAccommodation = useMemo(() => {
    return accommodations.find((a) => String(a.id) === data.accommodation_id);
  }, [data.accommodation_id, accommodations]);

  // Auto-calculate total price
  useEffect(() => {
    if (selectedAccommodation && nights > 0) {
      const calculatedTotal = nights * (selectedAccommodation.daily_price || 0);
      setData('total', String(calculatedTotal));
    }
  }, [selectedAccommodation, nights]);

  const handleAccommodationSelect = (accommodation: Accommodation) => {
    setData({
      ...data,
      accommodation_id: String(accommodation.id),
      daily_price: String(accommodation.daily_price ?? 0),
      // Reset guests if they exceed new limits
      adults: String(Math.min(Number(data.adults), accommodation.max_adults)),
      children: String(Math.min(Number(data.children), accommodation.max_children)),
    });
  };

  const handleCheckInSelect = (date?: Date) => {
    const check_in = toFormDate(date);
    const minCheckOutDate = toFormDate(addDays(check_in, 1));

    setData({
      ...data,
      check_in: toFormDate(date),
      check_out: isBefore(check_in, data.check_out) ? data.check_out : minCheckOutDate,
    });
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
                className="w-full justify-start text-left font-normal mt-2"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateDisplay(data.check_in) || 'Choisir la date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                disabled={{ before: /*isEditing && user.is_admin ? undefined :*/ startOfToday() }}
                selected={data.check_in ? new Date(data.check_in) : undefined}
                onSelect={handleCheckInSelect}
              />
            </PopoverContent>
          </Popover>
          <InputError message={errors.check_in} />
        </div>
        <div className="space-y-2">
          <Label className='flex items-center justify-between'>
            <div className="flex items-center gap-2">
              Départ
            </div>
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
                {formatDateDisplay(data.check_out) || 'Choisir la date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                disabled={{ before: data.check_in ? addDays(data.check_in, 1) : new Date() }}
                selected={data.check_out ? new Date(data.check_out) : undefined}
                onSelect={(date) => setData('check_out', toFormDate(date))}
              />
            </PopoverContent>
          </Popover>
          <InputError message={errors.check_out} />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Hébergement</Label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-1">
          {accommodations.map((accommodation) => {
            const isSelected = data.accommodation_id === String(accommodation.id);
            const isReserved = checkIsReserved(units, accommodation, data.check_in, data.check_out);
            return (
                <button
                    key={accommodation.id}
                    type="button"
                    disabled={isReserved}
                    onClick={() => handleAccommodationSelect(accommodation)}
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
                            style={{ backgroundColor: accommodation.color }}
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
          value={Number(data.children)}
          min={0}
          max={selectedAccommodation?.max_children}
          onChange={(val) => setData('children', String(val))}
          error={errors.children}
        />
      </div>

      <div className="space-y-3">
        <Label>Source</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {channels.map(chan => {
            const isSelected = data.channel_id === String(chan.id);
            return (
              <Button
                key={chan.id}
                type='button'
                onClick={() => setData('channel_id', String(chan.id))}
                className={`
                  px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all
                  flex items-center gap-2 border
                  ${isSelected
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-dark-surface text-gray-500 hover:bg-gray-100'
                  }
                `}
                style={isSelected ? { backgroundColor: chan.color } : {}}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isSelected ? 'white' : chan.color }}
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
          value={Number(data.total)}
          min={0}
          step={50}
          unit="DH"
          onChange={(val) => setData('total', String(val))}
          error={errors.total}
        />
      </div>
    </div>
  );
}
