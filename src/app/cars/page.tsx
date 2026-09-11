"use client";

import { useMemo, useState } from "react";
import { CarCard } from "@/components/cars/CarCard";
import { CarSearchBar } from "@/components/cars/CarSearchBar";
import { Disclaimer } from "@/components/finance/Disclaimer";
import { Select } from "@/components/ui/select";
import { useApp } from "@/context/AppProvider";
import {
  analyzeAffordability,
  calculateFuelCost,
  calculateTotalMonthlyCarCost,
  getAffordabilityStatus,
  getSafeDownPayment,
} from "@/lib/affordability";
import { getOnRoadPrice } from "@/lib/cars/pricing";
import { filterCars, getAllCars } from "@/lib/cars/repository";
import { brands } from "@/data/brands";
import type { BodyType, FuelType, TransmissionType } from "@/types/car";

export default function CarsPage() {
  const { profile, hasProfile } = useApp();
  const [query, setQuery] = useState("");
  const [brandId, setBrandId] = useState("all");
  const [bodyType, setBodyType] = useState("all");
  const [fuel, setFuel] = useState("all");
  const [transmission, setTransmission] = useState("all");

  const analysis = useMemo(
    () => (hasProfile ? analyzeAffordability(profile) : null),
    [hasProfile, profile],
  );

  const cars = useMemo(() => {
    return filterCars({
      query: query || undefined,
      brandId: brandId === "all" ? undefined : brandId,
      bodyType: bodyType === "all" ? undefined : (bodyType as BodyType),
      fuel: fuel === "all" ? undefined : (fuel as FuelType),
      transmission:
        transmission === "all"
          ? undefined
          : (transmission as TransmissionType),
    });
  }, [query, brandId, bodyType, fuel, transmission]);

  const enriched = useMemo(() => {
    const downPayment = hasProfile ? getSafeDownPayment(profile) : 0;
    return cars.map((car) => {
      const onRoad = getOnRoadPrice(car, profile.preferredCityId).price;
      const fuelCost = calculateFuelCost(
        {
          fuel: car.fuel,
          mileage: car.mileage,
          fuelEfficiencyUnit: car.fuelEfficiencyUnit,
          electricityRatePerKwh: car.electricityRatePerKwh,
        },
        profile.monthlyKm || 1000,
        profile.cityHighwaySplit || 70,
      );

      if (!hasProfile || !analysis) {
        return {
          car,
          onRoadPrice: onRoad,
          ownership: {
            emi: 0,
            fuel: fuelCost,
            insurance: 0,
            maintenance: 0,
            tyresConsumables: 0,
            totalMonthly: 0,
          },
        };
      }

      const ownership = calculateTotalMonthlyCarCost({
        onRoadPrice: onRoad,
        downPayment,
        annualInterestRate: profile.interestRate,
        loanTenureYears: profile.loanTenureYears,
        fuel: fuelCost,
        insuranceAnnual: car.insuranceAnnualEstimate,
        maintenanceMonthly: car.maintenanceMonthlyEstimate,
        tyresConsumablesMonthly: car.tyreConsumablesMonthlyEstimate,
      });
      const status = getAffordabilityStatus(
        ownership.totalMonthly,
        analysis.safeMonthlyBudget,
        analysis.stretchMonthlyBudget,
      );
      return { car, onRoadPrice: onRoad, ownership, status };
    });
  }, [cars, profile, hasProfile, analysis]);

  const all = getAllCars();
  const bodyTypes = [...new Set(all.map((c) => c.bodyType))].sort();
  const fuels = [...new Set(all.map((c) => c.fuel))].sort();
  const transmissions = [...new Set(all.map((c) => c.transmission))].sort();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Browse cars</h1>
        <p className="mt-1 text-muted-foreground">
          Search brands and models across the Indian market catalogue.
        </p>
      </div>

      <CarSearchBar value={query} onChange={setQuery} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Brand</span>
          <Select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            <option value="all">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Body</span>
          <Select value={bodyType} onChange={(e) => setBodyType(e.target.value)}>
            <option value="all">All</option>
            {bodyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Fuel</span>
          <Select value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="all">All</option>
            {fuels.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Transmission</span>
          <Select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
          >
            <option value="all">All</option>
            {transmissions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <p className="text-sm text-muted-foreground">{enriched.length} cars</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enriched.map(({ car, onRoadPrice, ownership, status }) => (
          <CarCard
            key={car.id}
            car={car}
            onRoadPrice={onRoadPrice}
            ownership={ownership}
            status={status}
            compact={!hasProfile}
          />
        ))}
      </div>

      <Disclaimer />
    </div>
  );
}
