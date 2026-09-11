import type { City } from "@/types/car";

/**
 * Indian metros with approximate RTO/registration uplift factors.
 * Used only to estimate on-road from ex-showroom — not verified live RTO tariffs.
 */
export const cities: City[] = [
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    rtoFactor: 1.12,
    isDefault: true,
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    rtoFactor: 1.14,
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    rtoFactor: 1.13,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    rtoFactor: 1.18,
  },
  {
    id: "delhi",
    name: "Delhi NCR",
    state: "Delhi",
    rtoFactor: 1.1,
  },
  {
    id: "pune",
    name: "Pune",
    state: "Maharashtra",
    rtoFactor: 1.16,
  },
  {
    id: "kochi",
    name: "Kochi",
    state: "Kerala",
    rtoFactor: 1.15,
  },
  {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    rtoFactor: 1.13,
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    rtoFactor: 1.11,
  },
];

export const DEFAULT_CITY_ID = "chennai";

export function getCityById(id: string): City | undefined {
  return cities.find((city) => city.id === id);
}

export function getDefaultCity(): City {
  const defaultCity = cities.find((city) => city.isDefault);
  if (!defaultCity) {
    throw new Error("Default city is not configured");
  }
  return defaultCity;
}
