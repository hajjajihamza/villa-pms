import { Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { NumericFormat } from 'react-number-format';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
//  Utils
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
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
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const isInvalid = !!error;

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
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

    const handleValueChange = (values: { floatValue?: number }) => {
        const { floatValue } = values;

        // If the input is empty or invalid, floatValue will be undefined.
        // We only want to update if we have a valid number.
        if (typeof floatValue === 'number') {
            updateValue(floatValue);
        }
    };

    const onBlur = () => {
        // Ensure the final value is within bounds when the user leaves the input
        updateValue(value);
    };

    // ────────────────────────────────────────────────
    //  Memo
    // ────────────────────────────────────────────────
    const isAtMin = useMemo(() => typeof min === 'number' && value <= min, [min, value]);
    const isAtMax = useMemo(() => typeof max === 'number' && value >= max, [max, value]);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <div className="space-y-3">
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
                    'bg-background/90 ring-ring/40 flex h-11 w-full items-center rounded-2xl border px-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_3px_rgba(0,0,0,0.06)] transition-all',
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
                    <NumericFormat
                        id={id}
                        value={value}
                        onValueChange={handleValueChange}
                        onBlur={onBlur}
                        disabled={disabled}
                        allowNegative={typeof min === 'number' ? min < 0 : true}
                        isAllowed={(values) => {
                            const { floatValue } = values;
                            if (floatValue === undefined) return true; // allow empty
                            if (typeof max === 'number' && floatValue > max) return false;
                            // We don't block min here to allow typing (e.g. typing "1" when min is "10")
                            return true;
                        }}
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

