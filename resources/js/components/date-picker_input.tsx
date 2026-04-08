import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toFormDate } from "@/lib/format-date";
import { ReactNode, useState } from "react";
import InputError from "@/components/input-error";
import { cn } from "@/lib/utils";
import { DayButtonProps } from "react-day-picker";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
interface Props {
    id?: string;
    label?: string | ReactNode;
    onChange?: (date: string) => void;
    error?: string;
    placeholder?: string;
    className?: string;
    disabled?: DayButtonProps['disabled'];
    selected?: Date;
}


// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function DatePickerInput({ id, label, onChange, error, placeholder, className, disabled, selected }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const [open, setOpen] = useState(false);

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id={id}
                        className={cn("h-11 justify-start font-normal", className)}
                    >
                        {selected ? selected.toLocaleDateString() : placeholder}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selected}
                        defaultMonth={selected}
                        captionLayout="dropdown"
                        disabled={disabled}
                        onSelect={(date) => {
                            setOpen(false)
                            onChange?.(toFormDate(date))
                        }}
                    />
                </PopoverContent>
            </Popover>
            <InputError message={error} />
        </Field>
    )
}
