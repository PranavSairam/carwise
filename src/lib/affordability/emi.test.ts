import { describe, expect, it } from "vitest";
import { calculateEMI, calculatePrincipalFromEMI } from "./emi";

describe("calculateEMI", () => {
  it("computes a standard reducing-balance EMI", () => {
    // P=10,00,000; 9% p.a.; 60 months → ≈ ₹20,758.36
    const emi = calculateEMI(1_000_000, 9, 60);
    expect(emi).toBeGreaterThan(20_750);
    expect(emi).toBeLessThan(20_770);
  });

  it("returns P/n when interest rate is 0%", () => {
    expect(calculateEMI(600_000, 0, 60)).toBe(10_000);
  });

  it("returns 0 for zero or negative principal", () => {
    expect(calculateEMI(0, 9, 60)).toBe(0);
    expect(calculateEMI(-1000, 9, 60)).toBe(0);
  });

  it("returns 0 for zero tenure", () => {
    expect(calculateEMI(500_000, 9, 0)).toBe(0);
  });

  it("guards NaN and Infinity inputs", () => {
    expect(calculateEMI(Number.NaN, 9, 60)).toBe(0);
    expect(calculateEMI(500_000, Number.NaN, 60)).toBe(0);
    expect(calculateEMI(Number.POSITIVE_INFINITY, 9, 60)).toBe(0);
    expect(Number.isFinite(calculateEMI(500_000, 9, 60))).toBe(true);
  });

  it("round-trips with calculatePrincipalFromEMI", () => {
    const principal = 800_000;
    const rate = 9;
    const months = 48;
    const emi = calculateEMI(principal, rate, months);
    const recovered = calculatePrincipalFromEMI(emi, rate, months);
    expect(Math.abs(recovered - principal)).toBeLessThan(1);
  });
});
