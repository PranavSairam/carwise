import { safeNumber } from "@/lib/formatters/number";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format as Indian locale currency, e.g. ₹1,50,000 */
export function formatINR(n: number): string {
  return INR.format(Math.round(safeNumber(n, 0)));
}

/** Compact Indian notation: ₹18.2L / ₹1.5Cr */
export function formatINRCompact(n: number): string {
  const value = Math.abs(safeNumber(n, 0));
  const sign = safeNumber(n, 0) < 0 ? "-" : "";

  if (value >= 1_00_00_000) {
    const cr = value / 1_00_00_000;
    return `${sign}₹${trimZeros(cr.toFixed(cr >= 10 ? 1 : 2))}Cr`;
  }
  if (value >= 1_00_000) {
    const lakhs = value / 1_00_000;
    return `${sign}₹${trimZeros(lakhs.toFixed(lakhs >= 10 ? 1 : 2))}L`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${sign}₹${trimZeros(thousands.toFixed(1))}K`;
  }
  return `${sign}${formatINR(value)}`;
}

/** Format a monthly amount, e.g. ₹29,500/month */
export function formatINRMonth(n: number): string {
  return `${formatINR(n)}/month`;
}

function trimZeros(raw: string): string {
  return raw.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}
