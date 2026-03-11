import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import PhoneInput from 'react-phone-input-2';
import { cn } from '@/lib/utils';

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

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-semibold">Téléphone (Optionnel)</Label>

        <PhoneInput
          country={data.country}
          value={data.phone}
          onChange={(phone, countryData: any) => {
            setData('phone', phone);
            setData('country', countryData.countryCode);
          }}
          containerClass="!w-full"
          inputClass={cn(
            "!w-full !h-11 !rounded-xl !bg-background/90 !border-input !shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)] !text-sm !pl-12",
            errors.phone && "!border-destructive"
          )}
          buttonClass="!bg-transparent !border-none !rounded-l-xl !hover:bg-muted/50"
          dropdownClass="!bg-popover !text-popover-foreground !rounded-xl !border-none !shadow-xl !mt-2"
        />
        <InputError message={errors.phone} />
      </div>
    </div>
  );
}