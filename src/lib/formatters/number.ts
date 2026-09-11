/** Coerce unknown numeric input to a finite number; never returns NaN. */
export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return Number.isFinite(fallback) ? fallback : 0;
}

export function clamp(value: number, min: number, max: number): number {
  const n = safeNumber(value, min);
  const lo = safeNumber(min, 0);
  const hi = safeNumber(max, lo);
  if (hi < lo) {
    return lo;
  }
  return Math.min(hi, Math.max(lo, n));
}

/** Return `percent`% of `value` (e.g. percentOf(1000, 20) → 200). */
export function percentOf(value: number, percent: number): number {
  const result = safeNumber(value, 0) * (safeNumber(percent, 0) / 100);
  return Number.isFinite(result) ? result : 0;
}

/** Convert a ratio (0–1 or any number) to a 0–100 percentage, clamped. */
export function toPercent(ratio: number, digits = 0): number {
  const pct = safeNumber(ratio, 0) * 100;
  if (!Number.isFinite(pct)) {
    return 0;
  }
  const factor = 10 ** clamp(digits, 0, 6);
  return Math.round(clamp(pct, 0, 100) * factor) / factor;
}

export function fromPercent(percent: number): number {
  const ratio = safeNumber(percent, 0) / 100;
  return Number.isFinite(ratio) ? ratio : 0;
}
