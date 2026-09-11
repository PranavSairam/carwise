import { clamp, safeNumber } from "@/lib/formatters/number";

/**
 * Standard reducing-balance EMI.
 * EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 * When annual rate is 0, EMI = P / n.
 */
export function calculateEMI(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
): number {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(tenureMonths)
  ) {
    return 0;
  }

  const P = safeNumber(principal, 0);
  const n = safeNumber(tenureMonths, 0);
  const annual = safeNumber(annualRatePercent, 0);

  if (P <= 0 || n <= 0) {
    return 0;
  }

  if (annual === 0) {
    return sanitize(P / n);
  }

  const r = annual / 12 / 100;
  if (r <= 0) {
    return sanitize(P / n);
  }

  const factor = Math.pow(1 + r, n);
  if (!Number.isFinite(factor) || factor === 1) {
    return sanitize(P / n);
  }

  const emi = (P * r * factor) / (factor - 1);
  return sanitize(emi);
}

/** Reverse EMI: maximum principal for a given monthly payment. */
export function calculatePrincipalFromEMI(
  emi: number,
  annualRatePercent: number,
  tenureMonths: number,
): number {
  if (
    !Number.isFinite(emi) ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(tenureMonths)
  ) {
    return 0;
  }

  const E = safeNumber(emi, 0);
  const n = safeNumber(tenureMonths, 0);
  const annual = safeNumber(annualRatePercent, 0);

  if (E <= 0 || n <= 0) {
    return 0;
  }

  if (annual === 0) {
    return sanitize(E * n);
  }

  const r = annual / 12 / 100;
  if (r <= 0) {
    return sanitize(E * n);
  }

  const factor = Math.pow(1 + r, n);
  if (!Number.isFinite(factor) || factor === 1) {
    return sanitize(E * n);
  }

  const principal = (E * (factor - 1)) / (r * factor);
  return sanitize(principal);
}

function sanitize(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return 0;
  }
  return clamp(value, 0, Number.MAX_SAFE_INTEGER);
}
