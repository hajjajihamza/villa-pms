import { Minus, Plus } from 'lucide-react';
import {  useEffect, useMemo, useState } from 'react';
import type {ReactNode} from 'react';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

type CounterInputProps = {
    id?: string;
    label?: string;
    icon?: ReactNode;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    error?: string;
    disabled?: boolean;
    maxIndicator?: boolean;
    onChange: (value: number) => void;
};

function clampValue(value: number, min?: number, max?: number) {
    let nextValue = value;

    if (typeof min === 'number') {
        nextValue = Math.max(nextValue, min);
    }

    if (typeof max === 'number') {
        nextValue = Math.min(nextValue, max);
    }

    return nextValue;
}

export default function InputCounter({
    id,
    label,
    icon,
    value,
    min,
    max,
    step = 1,
    unit,
    error,
    disabled = false,
    maxIndicator = true,
    onChange,
}: CounterInputProps) {
    const [inputValue, setInputValue] = useState(String(value));

    useEffect(() => {
        setInputValue(String(value));
    }, [value]);

    const isAtMin = useMemo(() => typeof min === 'number' && value <= min, [min, value]);
    const isAtMax = useMemo(() => typeof max === 'number' && value >= max, [max, value]);

    const updateValue = (nextValue: number) => {
        const clampedValue = clampValue(nextValue, min, max);
        onChange(clampedValue);
    };

    const onDecrement = () => {
        if (disabled || isAtMin) {
            return;
        }

        updateValue(value - step);
    };

    const onIncrement = () => {
        if (disabled || isAtMax) {
            return;
        }

        updateValue(value + step);
    };

    const onBlur = () => {
        if (inputValue.trim() === '') {
            const fallback = typeof min === 'number' ? min : 0;
            updateValue(fallback);
            return;
        }

        const parsedValue = Number(inputValue);

        if (Number.isNaN(parsedValue)) {
            setInputValue(String(value));
            return;
        }

        updateValue(parsedValue);
    };

    const isInvalid = Boolean(error);

    return (
        <div className="space-y-2">
            {(label || maxIndicator) && (
                <div className="flex items-center justify-between gap-2">
                    {label ? (
                        <label
                            htmlFor={id}
                            className="text-foreground/90 flex items-center gap-2 text-[13px] font-medium"
                        >
                            {icon ? (
                                <span className="text-muted-foreground inline-flex size-4 items-center justify-center">
                                    {icon}
                                </span>
                            ) : null}
                            {label}
                        </label>
                    ) : (
                        <span />
                    )}

                    {maxIndicator && typeof max === 'number' ? (
                        <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                            max {max}
                        </span>
                    ) : null}
                </div>
            )}

            <div
                className={cn(
                    'bg-background/90 ring-ring/40 flex h-12 w-full items-center rounded-2xl border px-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_3px_rgba(0,0,0,0.06)] transition-all',
                    'focus-within:border-ring focus-within:ring-2',
                    isInvalid && 'border-destructive/70 focus-within:border-destructive focus-within:ring-destructive/25',
                    disabled && 'opacity-60'
                )}
            >
                <button
                    type="button"
                    className={cn(
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border text-sm transition-all active:scale-95',
                        'border-border bg-muted/60 hover:bg-muted',
                        'disabled:pointer-events-none disabled:opacity-40'
                    )}
                    onClick={onDecrement}
                    disabled={disabled || isAtMin}
                    aria-label="Decrementer"
                >
                    <Minus className="size-4" />
                </button>

                <div className="flex min-w-0 flex-1 items-center justify-center px-2">
                    <input
                        id={id}
                        type="number"
                        inputMode="decimal"
                        value={inputValue}
                        min={min}
                        max={max}
                        step={step}
                        disabled={disabled}
                        onChange={(event) => setInputValue(event.target.value)}
                        onBlur={onBlur}
                        className="text-foreground w-full bg-transparent text-center text-lg font-semibold outline-none"
                    />

                    {unit ? (
                        <span className="text-muted-foreground ml-2 shrink-0 text-xs font-semibold uppercase tracking-wide">
                            {unit}
                        </span>
                    ) : null}
                </div>

                <button
                    type="button"
                    className={cn(
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border text-sm transition-all active:scale-95',
                        'border-border bg-muted/60 hover:bg-muted',
                        'disabled:pointer-events-none disabled:opacity-40'
                    )}
                    onClick={onIncrement}
                    disabled={disabled || isAtMax}
                    aria-label="Incrementer"
                >
                    <Plus className="size-4" />
                </button>
            </div>

            <InputError message={error} />
        </div>
    );
}
