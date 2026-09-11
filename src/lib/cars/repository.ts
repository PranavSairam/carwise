import { cars } from "@/data/cars";
import type { Car, CarFilters } from "@/types/car";

export function getAllCars(): Car[] {
  return [...cars];
}

export function getCarById(id: string): Car | undefined {
  return cars.find((car) => car.id === id);
}

export function getCarsByBrand(brandId: string): Car[] {
  return cars.filter((car) => car.brandId === brandId);
}

/**
 * Case-insensitive search across brand, model, variant, and tags.
 */
export function searchCars(query: string): Car[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return getAllCars();
  }

  return cars.filter((car) => {
    const haystack = [
      car.brand,
      car.model,
      car.variant,
      car.bodyType,
      car.fuel,
      ...(car.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

function matchesFilters(car: Car, filters: CarFilters): boolean {
  if (filters.brandId !== undefined && car.brandId !== filters.brandId) {
    return false;
  }
  if (filters.bodyType !== undefined && car.bodyType !== filters.bodyType) {
    return false;
  }
  if (filters.fuel !== undefined && car.fuel !== filters.fuel) {
    return false;
  }
  if (
    filters.transmission !== undefined &&
    car.transmission !== filters.transmission
  ) {
    return false;
  }
  if (
    filters.purchaseType !== undefined &&
    car.purchaseType !== filters.purchaseType
  ) {
    return false;
  }
  if (filters.seats !== undefined && car.seats !== filters.seats) {
    return false;
  }
  if (filters.featured !== undefined && Boolean(car.featured) !== filters.featured) {
    return false;
  }
  if (
    filters.minPrice !== undefined &&
    car.estimatedOnRoadPrice < filters.minPrice
  ) {
    return false;
  }
  if (
    filters.maxPrice !== undefined &&
    car.estimatedOnRoadPrice > filters.maxPrice
  ) {
    return false;
  }
  if (filters.tags !== undefined && filters.tags.length > 0) {
    const carTags = car.tags ?? [];
    const hasAllTags = filters.tags.every((tag) => carTags.includes(tag));
    if (!hasAllTags) {
      return false;
    }
  }
  if (filters.query !== undefined && filters.query.trim() !== "") {
    const matches = searchCars(filters.query).some((result) => result.id === car.id);
    if (!matches) {
      return false;
    }
  }
  return true;
}

export function filterCars(filters: CarFilters): Car[] {
  return cars.filter((car) => matchesFilters(car, filters));
}
