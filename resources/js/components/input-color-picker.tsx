import { Palette } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Props = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
};

const DEFAULT_COLOR = '#0ea5e9';

function normalizeHexColor(value: string) {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        return value;
    }

    return DEFAULT_COLOR;
}

export default function InputColorPicker({
    id,
    label,
    value,
    onChange,
    error,
}: Props) {
    const normalizedColor = normalizeHexColor(value);

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Label
                    htmlFor={id}
                    className="flex items-center gap-2 text-[13px] font-medium text-foreground/90"
                >
                    <span className="inline-flex size-4 items-center justify-center text-muted-foreground">
                        <Palette className={'size-4'} />
                    </span>
                    {label}
                </Label>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => onChange(DEFAULT_COLOR)}
                >
                    Reinitialiser
                </Button>
            </div>

            <div
                className={cn(
                    'flex items-center justify-between rounded-3xl border bg-muted/30 p-5 shadow-inner sm:p-6',
                    error && 'border-destructive/70 ring-2 ring-destructive/20',
                )}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background shadow-lg"
                        style={{ color: normalizedColor }}
                    >
                        <Palette
                            className="size-5"
                            style={{ color: normalizedColor }}
                        />
                    </div>

                    <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                        Couleur Planning
                    </Label>
                </div>

                <Input
                    id={id}
                    type="color"
                    value={normalizedColor}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-12 w-12 cursor-pointer overflow-hidden rounded-full border-none bg-transparent p-0"
                    aria-invalid={Boolean(error)}
                />
            </div>

            <InputError message={error} />
        </div>
    );
}
