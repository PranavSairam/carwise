export interface FinancialProfile {
  monthlyIncome: number;
  otherMonthlyIncome: number;
  monthlyExpenses: number;
  expenseMode: "total" | "breakdown";
  expenseBreakdown?: {
    rent: number;
    food: number;
    utilities: number;
    insurance: number;
    education: number;
    entertainment: number;
    other: number;
  };
  existingEMIs: number;
  creditCardCommitments: number;
  otherCommitments: number;
  savings: number;
  emergencyFundTarget: number;
  downPayment: number;
  monthlyKm: number;
  cityHighwaySplit: number; // 0-100 city %
  loanTenureYears: 3 | 4 | 5 | 6 | 7;
  interestRate: number; // annual %
  preferredCityId: string;
}

export type AffordabilityStatus = "comfortable" | "stretch" | "not_recommended";

/** Estimated financial breathing room after recommended car ownership — not a credit score. */
export type FinancialComfort = "high" | "moderate" | "low";

export interface OwnershipCostBreakdown {
  emi: number;
  fuel: number;
  insurance: number;
  maintenance: number;
  tyresConsumables: number;
  /** Optional FASTag / tolls (₹/month). */
  fastag?: number;
  totalMonthly: number;
}

export interface AffordabilityResult {
  disposableIncome: number;
  safeMonthlyBudget: number;
  stretchMonthlyBudget: number;
  comfortablePriceRange: { min: number; max: number };
  stretchPriceRange: { min: number; max: number };
  emergencyFundWarning: boolean;
  remainingSavingsAfterDownPayment: number;
  /** Disposable income minus recommended (comfortable) ownership budget. */
  moneyLeftAfterRecommendedOwnership: number;
  financialComfort: FinancialComfort;
  statusForCost: (monthlyCost: number) => AffordabilityStatus;
}
