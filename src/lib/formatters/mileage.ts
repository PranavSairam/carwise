import type { Car } from "@/types/car";

export function formatMileage(car: Pick<Car, "mileage" | "fuelEfficiencyUnit" | "fuel">): string {
  const value = Number.isFinite(car.mileage) ? car.mileage : 0;
  if (car.fuel === "EV" || car.fuelEfficiencyUnit === "km_per_kwh") {
    return `${value} km/kWh`;
  }
  return `${value} kmpl`;
}

export function formatFuelLabel(fuel: Car["fuel"]): string {
  switch (fuel) {
    case "EV":
      return "Est. charging";
    case "CNG":
      return "Est. CNG";
    case "Hybrid":
      return "Est. fuel";
    default:
      return "Est. fuel";
  }
}
