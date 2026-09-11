import { describe, expect, it } from "vitest";
import {
  DEFAULT_CAR_LOAN_RATE,
  calculateEMI,
  calculateFuelCost,
  fuelPrices,
} from "@/lib/affordability";

describe("central financial assumptions", () => {
  it("defaults car loan rate to 7.45% p.a.", () => {
    expect(DEFAULT_CAR_LOAN_RATE).toBe(7.45);
  });

  it("EMI uses the configured rate when passed through", () => {
    const emiAtDefault = calculateEMI(1_000_000, DEFAULT_CAR_LOAN_RATE, 60);
    const emiAtNine = calculateEMI(1_000_000, 9, 60);
    expect(emiAtDefault).toBeLessThan(emiAtNine);
    expect(emiAtDefault).toBeGreaterThan(19_000);
    expect(emiAtDefault).toBeLessThan(21_000);
  });

  it("uses fuel-specific unit prices including EV electricity", () => {
    expect(fuelPrices.petrol).toBeGreaterThan(0);
    expect(fuelPrices.diesel).toBeLessThan(fuelPrices.petrol);

    const petrol = calculateFuelCost(
      { fuel: "Petrol", mileage: 15, fuelEfficiencyUnit: "kmpl" },
      1500,
    );
    const diesel = calculateFuelCost(
      { fuel: "Diesel", mileage: 15, fuelEfficiencyUnit: "kmpl" },
      1500,
    );
    const ev = calculateFuelCost(
      {
        fuel: "EV",
        mileage: 6,
        fuelEfficiencyUnit: "km_per_kwh",
      },
      1500,
    );

    expect(petrol).toBeGreaterThan(diesel);
    expect(ev).toBeCloseTo((1500 / 6) * fuelPrices.electricity, 5);
  });
});
