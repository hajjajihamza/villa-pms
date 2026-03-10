import { format, isValid, parseISO } from 'date-fns';

export function formatDateDisplay(value?: string | null): string {
    if (!value) {
        return '';
    }

    const parsed = parseISO(value);

    if (!isValid(parsed)) {
        return value;
    }

    return format(parsed, 'dd/MM/yyyy');
}

export function toFormDate(value?: Date | null): string {
    if (!value || !isValid(value)) {
        return '';
    }

    return format(value, 'yyyy-MM-dd');
}
