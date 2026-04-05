import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toFormDate } from "@/lib/format-date";
import { useState } from "react";
import InputError from "@/components/input-error";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
interface Props {
    id?: string;
    label?: string;
    defaultValue?: string;
    onChange?: (date: string) => void;
    error?: string;
    placeholder?: string;
    className?: string;
}


// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function DatePickerInput({ id, label, defaultValue, onChange, error, placeholder, className }: Props) {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(defaultValue ? new Date(defaultValue) : undefined);

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
                        {date ? date.toLocaleDateString() : placeholder}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        defaultMonth={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                            setDate(date)
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
