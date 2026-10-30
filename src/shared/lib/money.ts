export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "PKR";

export const toMinor = (major: number) => Math.round(major * 100);

export const formatMinor = (minor: number, currency = CURRENCY) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);
