import {
  DEFAULT_ASSUMED_MILEAGE_KMPL,
  DEFAULT_INSURANCE_MONTHLY,
  DEFAULT_MAINTENANCE_MONTHLY,
  DEFAULT_TYRES_MONTHLY,
  MIN_EMERGENCY_MONTHS,
  PETROL_PRICE_PER_LITRE,
  SAFE_OWNERSHIP_RATIO,
  STRETCH_OWNERSHIP_RATIO,
} from "@/lib/affordability/constants";
import { calculatePrincipalFromEMI } from "@/lib/affordability/emi";
import { clamp, percentOf, safeNumber } from "@/lib/formatters/number";
import type {
  AffordabilityResult,
  AffordabilityStatus,
  FinancialComfort,
  FinancialProfile,
} from "@/types/finance";

export function resolveMonthlyExpenses(profile: FinancialProfile): number {
  if (profile.expenseMode === "breakdown" && profile.expenseBreakdown) {
    const b = profile.expenseBreakdown;
    return (
      safeNumber(b.rent, 0) +
      safeNumber(b.food, 0) +
      safeNumber(b.utilities, 0) +
      safeNumber(b.insurance, 0) +
      safeNumber(b.education, 0) +
      safeNumber(b.entertainment, 0) +
      safeNumber(b.other, 0)
    );
  }
  return Math.max(0, safeNumber(profile.monthlyExpenses, 0));
}

export function calculateDisposableIncome(profile: FinancialProfile): number {
  const income =
    safeNumber(profile.monthlyIncome, 0) +
    safeNumber(profile.otherMonthlyIncome, 0);
  const expenses = resolveMonthlyExpenses(profile);
  const commitments =
    safeNumber(profile.existingEMIs, 0) +
    safeNumber(profile.creditCardCommitments, 0) +
    safeNumber(profile.otherCommitments, 0);

  return Math.max(0, income - expenses - commitments);
}

/** Conservative: 20% of disposable income for total ownership. */
export function calculateSafeCarBudget(disposableIncome: number): number {
  return sanitize(percentOf(safeNumber(disposableIncome, 0), SAFE_OWNERSHIP_RATIO * 100));
}

export function calculateStretchCarBudget(disposableIncome: number): number {
  return sanitize(
    percentOf(safeNumber(disposableIncome, 0), STRETCH_OWNERSHIP_RATIO * 100),
  );
}

export function calculateLoanAmount(
  onRoadPrice: number,
  downPayment: number,
): number {
  return Math.max(
    0,
    safeNumber(onRoadPrice, 0) - safeNumber(downPayment, 0),
  );
}

/**
 * Score 0–100: higher is better / more affordable.
 * Comfortable → ~70–100, stretch → ~40–69, over budget → 0–39.
 */
export function calculateAffordabilityScore(
  monthlyCost: number,
  safeBudget: number,
  stretchBudget: number,
): number {
  const cost = Math.max(0, safeNumber(monthlyCost, 0));
  const safe = Math.max(0, safeNumber(safeBudget, 0));
  const stretch = Math.max(safe, safeNumber(stretchBudget, 0));

  if (safe <= 0 && stretch <= 0) {
    return cost <= 0 ? 100 : 0;
  }

  if (cost <= safe) {
    if (safe === 0) {
      return cost === 0 ? 100 : 70;
    }
    const utilization = cost / safe;
    return sanitize(Math.round(100 - utilization * 30));
  }

  if (cost <= stretch) {
    const span = stretch - safe || 1;
    const t = (cost - safe) / span;
    return sanitize(Math.round(69 - t * 29));
  }

  const overshoot = cost / (stretch || 1);
  return sanitize(Math.round(clamp(39 / overshoot, 0, 39)));
}

export function getAffordabilityStatus(
  monthlyCost: number,
  safeBudget: number,
  stretchBudget: number,
): AffordabilityStatus {
  const cost = safeNumber(monthlyCost, 0);
  if (cost <= safeNumber(safeBudget, 0)) {
    return "comfortable";
  }
  if (cost <= safeNumber(stretchBudget, 0)) {
    return "stretch";
  }
  return "not_recommended";
}

export function resolveEmergencyFundTarget(profile: FinancialProfile): number {
  const explicit = safeNumber(profile.emergencyFundTarget, 0);
  if (explicit > 0) {
    return explicit;
  }
  const monthlyBurn =
    resolveMonthlyExpenses(profile) +
    safeNumber(profile.existingEMIs, 0) +
    safeNumber(profile.creditCardCommitments, 0) +
    safeNumber(profile.otherCommitments, 0);
  return monthlyBurn * MIN_EMERGENCY_MONTHS;
}

/**
 * Largest down payment that still leaves the emergency fund intact.
 * Never recommends emptying savings for a larger loan.
 */
export function getSafeDownPayment(profile: FinancialProfile): number {
  const savings = Math.max(0, safeNumber(profile.savings, 0));
  const emergency = resolveEmergencyFundTarget(profile);
  const requested = Math.max(0, safeNumber(profile.downPayment, 0));
  const maxSafe = Math.max(0, savings - emergency);
  return Math.min(requested, maxSafe, savings);
}

export function checkEmergencyFundWarning(profile: FinancialProfile): boolean {
  const remaining =
    safeNumber(profile.savings, 0) - safeNumber(profile.downPayment, 0);
  return remaining < resolveEmergencyFundTarget(profile);
}

/**
 * Estimate max on-road price supportable by a monthly ownership budget.
 * Non-EMI running costs are approximated from driving habits so price
 * ranges stay conservative (we never maximize debt capacity).
 */
export function estimatePriceFromMonthlyBudget(
  monthlyBudget: number,
  profile: FinancialProfile,
  downPaymentOverride?: number,
): number {
  const budget = Math.max(0, safeNumber(monthlyBudget, 0));
  const downPayment =
    downPaymentOverride !== undefined
      ? Math.max(0, safeNumber(downPaymentOverride, 0))
      : getSafeDownPayment(profile);

  const nonEmi = estimateBaselineNonEmiMonthly(profile);
  const emiCapacity = Math.max(0, budget - nonEmi);

  if (emiCapacity <= 0) {
    return sanitize(downPayment);
  }

  const tenureMonths = profile.loanTenureYears * 12;
  const loan = calculatePrincipalFromEMI(
    emiCapacity,
    profile.interestRate,
    tenureMonths,
  );
  return sanitize(loan + downPayment);
}

export function estimateBaselineNonEmiMonthly(
  profile: FinancialProfile,
): number {
  const km = Math.max(0, safeNumber(profile.monthlyKm, 0));
  const fuel =
    km > 0
      ? (km / DEFAULT_ASSUMED_MILEAGE_KMPL) * PETROL_PRICE_PER_LITRE
      : 0;
  return sanitize(
    fuel +
      DEFAULT_INSURANCE_MONTHLY +
      DEFAULT_MAINTENANCE_MONTHLY +
      DEFAULT_TYRES_MONTHLY,
  );
}

export function analyzeAffordability(
  profile: FinancialProfile,
): AffordabilityResult {
  const disposableIncome = calculateDisposableIncome(profile);
  const safeMonthlyBudget = calculateSafeCarBudget(disposableIncome);
  const stretchMonthlyBudget = calculateStretchCarBudget(disposableIncome);

  const safeDown = getSafeDownPayment(profile);
  const comfortableMax = estimatePriceFromMonthlyBudget(
    safeMonthlyBudget,
    profile,
    safeDown,
  );
  const stretchMax = estimatePriceFromMonthlyBudget(
    stretchMonthlyBudget,
    profile,
    safeDown,
  );

  const comfortablePriceRange = {
    min: sanitize(comfortableMax * 0.55),
    max: sanitize(comfortableMax),
  };
  const stretchPriceRange = {
    min: sanitize(Math.max(comfortableMax, stretchMax * 0.7)),
    max: sanitize(Math.max(stretchMax, comfortableMax)),
  };

  const remainingSavingsAfterDownPayment = sanitize(
    safeNumber(profile.savings, 0) - safeNumber(profile.downPayment, 0),
  );

  const moneyLeftAfterRecommendedOwnership = sanitize(
    disposableIncome - safeMonthlyBudget,
  );
  const financialComfort = getFinancialComfort(
    disposableIncome,
    safeMonthlyBudget,
  );

  return {
    disposableIncome,
    safeMonthlyBudget,
    stretchMonthlyBudget,
    comfortablePriceRange,
    stretchPriceRange,
    emergencyFundWarning: checkEmergencyFundWarning(profile),
    remainingSavingsAfterDownPayment,
    moneyLeftAfterRecommendedOwnership,
    financialComfort,
    statusForCost: (monthlyCost: number) =>
      getAffordabilityStatus(
        monthlyCost,
        safeMonthlyBudget,
        stretchMonthlyBudget,
      ),
  };
}

/**
 * Breathing room after recommended ownership — not creditworthiness.
 * High: ≥50% of disposable remains · Moderate: ≥25% · else Low.
 */
export function getFinancialComfort(
  disposableIncome: number,
  recommendedOwnership: number,
): FinancialComfort {
  const disposable = Math.max(0, safeNumber(disposableIncome, 0));
  if (disposable <= 0) {
    return "low";
  }
  const left = Math.max(0, disposable - safeNumber(recommendedOwnership, 0));
  const ratio = left / disposable;
  if (ratio >= 0.5) {
    return "high";
  }
  if (ratio >= 0.25) {
    return "moderate";
  }
  return "low";
}

function sanitize(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return 0;
  }
  return clamp(value, 0, Number.MAX_SAFE_INTEGER);
}
