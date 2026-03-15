import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { CountryDropdown } from '../ui/country-dropdown';

type Props = {
  data: any;
  setData: (key: any, value?: any) => void;
  errors: any;
};

export default function StepVisitor({ data, setData, errors }: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="full_name">Nom Complet</Label>
        <Input
          id="expense-name"
          value={data.full_name}
          onChange={(e) => setData('full_name', e.target.value)}
          placeholder="Nom du visiteur"
          className={cn(
            'h-11 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
            errors.full_name &&
            'border-destructive',
          )}
        />
        <InputError message={errors.full_name} />
      </div>

      <div className='grid lg:grid-cols-2 gap-4'>
        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <CountryDropdown
            placeholder="Sélectionner un pays"
            defaultValue={data.country}
            onChange={(country) => setData('country', country)}
          />
          <InputError message={errors.country} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold">Téléphone (Optionnel)</Label>

          <PhoneInput
            defaultCountry="ma"
            value={data.phone}
            onChange={(phone) => setData('phone', phone)}
            inputClassName={cn(
              "w-full",
              errors.phone && "border-destructive"
            )}
            className='h-11'
          />
          <InputError message={errors.phone} />
        </div>
      </div>

    </div>
  );
}