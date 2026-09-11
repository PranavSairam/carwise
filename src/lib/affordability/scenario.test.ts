import { describe, expect, it } from "vitest";
import {
  analyzeAffordability,
  calculateDisposableIncome,
  calculateEMI,
  calculateSafeCarBudget,
} from "@/lib/affordability";

describe("sample user scenario", () => {
  const profile = {
    monthlyIncome: 150_000,
    otherMonthlyIncome: 0,
    monthlyExpenses: 60_000,
    expenseMode: "total" as const,
    existingEMIs: 0,
    creditCardCommitments: 0,
    otherCommitments: 0,
    savings: 1_000_000,
    emergencyFundTarget: 300_000,
    downPayment: 500_000,
    monthlyKm: 1_000,
    cityHighwaySplit: 70,
    loanTenureYears: 5 as const,
    interestRate: 7.45,
    preferredCityId: "chennai",
  };

  it("computes disposable and safe budget", () => {
    const disposable = calculateDisposableIncome(profile);
    expect(disposable).toBe(90_000);
    expect(calculateSafeCarBudget(disposable)).toBe(18_000);
  });

  it("analyzeAffordability returns sensible ranges", () => {
    const a = analyzeAffordability(profile);
    expect(a.disposableIncome).toBe(90_000);
    expect(a.safeMonthlyBudget).toBe(18_000);
    expect(a.stretchMonthlyBudget).toBe(27_000);
    expect(a.emergencyFundWarning).toBe(false);
    expect(a.remainingSavingsAfterDownPayment).toBe(500_000);
    expect(a.moneyLeftAfterRecommendedOwnership).toBe(72_000);
    expect(a.financialComfort).toBe("high");
    expect(a.comfortablePriceRange.max).toBeGreaterThan(500_000);
  });

  it("handles zero interest", () => {
    expect(calculateEMI(600_000, 0, 60)).toBe(10_000);
  });
});
