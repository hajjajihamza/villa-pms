type FormatNumberOptions = {
    decimals?: number;
    decimalSeparator?: string;
    thousandsSeparator?: string;
    endWith?: string;
};

export function formatNumber(
    value: number | string,
    {
        decimals = 2,
        decimalSeparator = '.',
        thousandsSeparator = ' ',
        endWith = '',
    }: FormatNumberOptions = {},
) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return '';
    }

    const normalizedDecimals = Math.max(0, decimals);
    const fractionDigits = Number.isInteger(numericValue)
        ? 0
        : normalizedDecimals;

    const enUSFormatted = numericValue.toLocaleString('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
        useGrouping: true,
    });

    const [integerPart, decimalPart] = enUSFormatted.split('.');
    const groupedInteger = integerPart.replaceAll(',', thousandsSeparator);
    const formattedNumber = decimalPart
        ? `${groupedInteger}${decimalSeparator}${decimalPart}`
        : groupedInteger;

    const suffix = endWith.trim();

    return suffix ? `${formattedNumber} ${suffix}` : formattedNumber;
}

export type { FormatNumberOptions };
