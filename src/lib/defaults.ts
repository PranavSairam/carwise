import {
  DATA_ASSUMPTIONS_TEXT,
  DEFAULT_CAR_LOAN_RATE,
  DEFAULT_CITY_ID,
} from "@/lib/affordability/constants";
import type { FinancialProfile } from "@/types/finance";

/**
 * Demo-friendly defaults: income starts at zero so results redirect until
 * onboarding, while loan/driving presets are sensible for India.
 */
export const DEFAULT_FINANCIAL_PROFILE: FinancialProfile = {
  monthlyIncome: 0,
  otherMonthlyIncome: 0,
  monthlyExpenses: 0,
  expenseMode: "total",
  expenseBreakdown: {
    rent: 0,
    food: 0,
    utilities: 0,
    insurance: 0,
    education: 0,
    entertainment: 0,
    other: 0,
  },
  existingEMIs: 0,
  creditCardCommitments: 0,
  otherCommitments: 0,
  savings: 0,
  emergencyFundTarget: 150_000,
  downPayment: 0,
  monthlyKm: 1000,
  cityHighwaySplit: 70,
  loanTenureYears: 5,
  interestRate: DEFAULT_CAR_LOAN_RATE,
  preferredCityId: DEFAULT_CITY_ID,
};

export const MAX_COMPARE_CARS = 4;

export const DISCLAIMER_TEXT = DATA_ASSUMPTIONS_TEXT;