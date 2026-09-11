import {
  DEFAULT_FASTAG_MONTHLY,
  fuelPrices,
} from "@/lib/affordability/constants";
import { calculateEMI } from "@/lib/affordability/emi";
import { clamp, safeNumber } from "@/lib/formatters/number";
import type { OwnershipCostBreakdown } from "@/types/finance";

export type FuelKind = "Petrol" | "Diesel" | "CNG" | "Hybrid" | "EV";
export type FuelEfficiencyUnit = "kmpl" | "km_per_kwh";

export interface FuelCostCarInput {
  fuel: FuelKind;
  mileage: number;
  fuelEfficiencyUnit: FuelEfficiencyUnit;
  electricityRatePerKwh?: number;
}

/**
 * Estimate monthly fuel / energy cost from km × efficiency × fuelPrices.
 * cityHighwaySplit reserved for future city vs highway mileage splits.
 */
export function calculateFuelCost(
  car: FuelCostCarInput,
  monthlyKm: number,
  _cityHighwaySplit?: number,
): number {
  const km = Math.max(0, safeNumber(monthlyKm, 0));
  const mileage = Math.max(0, safeNumber(car.mileage, 0));

  if (km === 0 || mileage === 0) {
    return 0;
  }

  if (car.fuelEfficiencyUnit === "km_per_kwh" || car.fuel === "EV") {
    const rate = safeNumber(
      car.electricityRatePerKwh,
      fuelPrices.electricity,
    );
    return sanitize((km / mileage) * rate);
  }

  const pricePerUnit = unitPriceForFuel(car.fuel);
  // Hybrid treated as petrol-equivalent for MVP estimates.
  return sanitize((km / mileage) * pricePerUnit);
}

export function calculateInsuranceCost(annualEstimate: number): number {
  return sanitize(safeNumber(annualEstimate, 0) / 12);
}

export function calculateMaintenanceCost(monthlyEstimate: number): number {
  return sanitize(safeNumber(monthlyEstimate, 0));
}

export interface TotalMonthlyCarCostInput {
  onRoadPrice: number;
  downPayment: number;
  annualInterestRate: number;
  loanTenureYears: number;
  fuel: number;
  insuranceAnnual: number;
  maintenanceMonthly: number;
  tyresConsumablesMonthly: number;
  /** Optional FASTag / tolls (₹/month). Omit or 0 to exclude. */
  fastagMonthly?: number;
}

export function calculateTotalMonthlyCarCost(
  input: TotalMonthlyCarCostInput,
): OwnershipCostBreakdown {
  const loanAmount = Math.max(
    0,
    safeNumber(input.onRoadPrice, 0) - safeNumber(input.downPayment, 0),
  );
  const tenureMonths = Math.max(
    1,
    Math.round(safeNumber(input.loanTenureYears, 0) * 12),
  );
  const emi = calculateEMI(
    loanAmount,
    input.annualInterestRate,
    tenureMonths,
  );
  const fuel = sanitize(input.fuel);
  const insurance = calculateInsuranceCost(input.insuranceAnnual);
  const maintenance = calculateMaintenanceCost(input.maintenanceMonthly);
  const tyresConsumables = sanitize(input.tyresConsumablesMonthly);
  const fastag =
    input.fastagMonthly === undefined
      ? DEFAULT_FASTAG_MONTHLY
      : sanitize(input.fastagMonthly);
  const totalMonthly = sanitize(
    emi + fuel + insurance + maintenance + tyresConsumables + fastag,
  );

  return {
    emi,
    fuel,
    insurance,
    maintenance,
    tyresConsumables,
    fastag,
    totalMonthly,
  };
}

function unitPriceForFuel(fuel: FuelKind): number {
  switch (fuel) {
    case "Diesel":
      return fuelPrices.diesel;
    case "CNG":
      return fuelPrices.cng;
    case "Petrol":
    case "Hybrid":
    case "EV":
    default:
      return fuelPrices.petrol;
  }
}

function sanitize(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return 0;
  }
  return clamp(value, 0, Number.MAX_SAFE_INTEGER);
}
