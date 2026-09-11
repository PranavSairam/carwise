import type { Car, DataConfidence } from "@/types/car";
import { getCityById } from "@/data/cities";

/** Estimated add-ons used when building on-road from ex-showroom (₹). */
const FASTAG_CHARGE = 600;
const HANDLING_OTHER = 15_000;

export type DataStatus = "verified" | "estimated";

export interface OnRoadBreakdown {
  exShowroom: number;
  registrationRto: number;
  insuranceAllowance: number;
  fastag: number;
  otherCharges: number;
  estimatedOnRoad: number;
}

export interface OnRoadPriceResult {
  price: number;
  label: string;
  confidence: DataConfidence;
  exShowroom: number;
  breakdown?: OnRoadBreakdown;
  cityId: string;
  cityName: string;
}

export function getDataStatus(car: Pick<Car, "dataConfidence">): DataStatus {
  return car.dataConfidence === "verified" ? "verified" : "estimated";
}

/**
 * Pricing layer: ex-showroom → estimated on-road for an Indian city.
 * Prefers city-specific database rows when present; otherwise derives from
 * ex-showroom × city RTO factor + insurance/FASTag allowances.
 */
export function getOnRoadPrice(car: Car, cityId: string): OnRoadPriceResult {
  const city = getCityById(cityId);
  const cityName = city?.name ?? cityId;
  const exShowroom = car.exShowroomPrice;
  const cityPrice = car.cityPrices?.find((entry) => entry.cityId === cityId);

  if (cityPrice) {
    const breakdown = buildBreakdownFromTotal(
      exShowroom,
      cityPrice.onRoadPrice,
      car.insuranceAnnualEstimate,
    );
    return {
      price: cityPrice.onRoadPrice,
      label: `Estimated on-road price (${cityName})`,
      confidence: cityPrice.confidence,
      exShowroom,
      breakdown,
      cityId,
      cityName,
    };
  }

  const rtoFactor = city?.rtoFactor ?? 1.12;
  const registrationRto = Math.round(exShowroom * (rtoFactor - 1));
  const insuranceAllowance = Math.round(car.insuranceAnnualEstimate);
  const estimatedOnRoad =
    exShowroom +
    registrationRto +
    insuranceAllowance +
    FASTAG_CHARGE +
    HANDLING_OTHER;

  // Prefer stored national estimate when close; otherwise use derived.
  const price =
    car.estimatedOnRoadPrice > 0
      ? Math.round((car.estimatedOnRoadPrice + estimatedOnRoad) / 2)
      : estimatedOnRoad;

  const breakdown: OnRoadBreakdown = {
    exShowroom,
    registrationRto,
    insuranceAllowance,
    fastag: FASTAG_CHARGE,
    otherCharges: HANDLING_OTHER,
    estimatedOnRoad: price,
  };

  return {
    price,
    label: `Estimated on-road price (${cityName})`,
    confidence: car.dataConfidence,
    exShowroom,
    breakdown,
    cityId,
    cityName,
  };
}

function buildBreakdownFromTotal(
  exShowroom: number,
  onRoad: number,
  insuranceAnnual: number,
): OnRoadBreakdown {
  const insuranceAllowance = Math.round(insuranceAnnual);
  const remainder = Math.max(
    0,
    onRoad - exShowroom - insuranceAllowance - FASTAG_CHARGE,
  );
  return {
    exShowroom,
    registrationRto: remainder,
    insuranceAllowance,
    fastag: FASTAG_CHARGE,
    otherCharges: 0,
    estimatedOnRoad: onRoad,
  };
}
