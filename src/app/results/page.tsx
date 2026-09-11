"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CarCard } from "@/components/cars/CarCard";
import { DataAssumptions } from "@/components/finance/DataAssumptions";
import { Disclaimer } from "@/components/finance/Disclaimer";
import { EmergencyFundWarning } from "@/components/finance/EmergencyFundWarning";
import { AffordabilityRange } from "@/components/results/AffordabilityRange";
import { BudgetSummary } from "@/components/results/BudgetSummary";
import { IncomeAllocation } from "@/components/results/IncomeAllocation";
import {
  ResultsFilters,
  type ResultsFilterState,
} from "@/components/results/ResultsFilters";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppProvider";
import {
  analyzeAffordability,
  resolveEmergencyFundTarget,
  rankCars,
} from "@/lib/affordability";
import { getOnRoadPrice } from "@/lib/cars/pricing";
import { getAllCars } from "@/lib/cars/repository";
import { getCityById } from "@/data/cities";
import type { Car } from "@/types/car";
import type { RankedCar } from "@/lib/affordability";

type RankedMatch = RankedCar & { car: Car; onRoadPrice: number };

export default function ResultsPage() {
  const router = useRouter();
  const { profile, preferences, hasProfile, hydrated, profileReady } = useApp();
  const [filters, setFilters] = useState<ResultsFilterState>({
    status: "all",
    sort: "score",
    bodyType: "all",
    fuel: "all",
    transmission: "all",
    brand: "all",
    seats: "all",
  });

  useEffect(() => {
    if (hydrated && profileReady && !hasProfile) {
      router.replace("/onboarding");
    }
  }, [hydrated, profileReady, hasProfile, router]);

  const analysis = useMemo(() => analyzeAffordability(profile), [profile]);

  const ranked = useMemo(() => {
    const cars = getAllCars();
    const results = rankCars(cars, profile, preferences, analysis, {
      onRoadPrice: (car) => getOnRoadPrice(car, profile.preferredCityId).price,
    });
    const byId = new Map(cars.map((c) => [c.id, c]));
    return results
      .map((r) => {
        const car = byId.get(r.carId);
        if (!car) return null;
        return {
          ...r,
          car,
          onRoadPrice: getOnRoadPrice(car, profile.preferredCityId).price,
        };
      })
      .filter((r): r is RankedMatch => r !== null);
  }, [profile, preferences, analysis]);

  const bodyTypes = useMemo(
    () => [...new Set(ranked.map((r) => r.car.bodyType))].sort(),
    [ranked],
  );
  const fuels = useMemo(
    () => [...new Set(ranked.map((r) => r.car.fuel))].sort(),
    [ranked],
  );
  const transmissions = useMemo(
    () => [...new Set(ranked.map((r) => r.car.transmission))].sort(),
    [ranked],
  );
  const brands = useMemo(
    () => [...new Set(ranked.map((r) => r.car.brand))].sort(),
    [ranked],
  );
  const seatOptions = useMemo(
    () => [...new Set(ranked.map((r) => r.car.seats))].sort((a, b) => a - b),
    [ranked],
  );

  const matchingProfile = useMemo(
    () => ranked.filter((r) => r.status !== "not_recommended"),
    [ranked],
  );

  const visible = useMemo(() => {
    let list = [...ranked];
    if (filters.status !== "all") {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters.bodyType !== "all") {
      list = list.filter((r) => r.car.bodyType === filters.bodyType);
    }
    if (filters.fuel !== "all") {
      list = list.filter((r) => r.car.fuel === filters.fuel);
    }
    if (filters.transmission !== "all") {
      list = list.filter((r) => r.car.transmission === filters.transmission);
    }
    if (filters.brand !== "all") {
      list = list.filter((r) => r.car.brand === filters.brand);
    }
    if (filters.seats !== "all") {
      list = list.filter((r) => r.car.seats === Number(filters.seats));
    }
    switch (filters.sort) {
      case "price_asc":
        list.sort((a, b) => a.onRoadPrice - b.onRoadPrice);
        break;
      case "monthly_asc":
        list.sort(
          (a, b) => a.ownership.totalMonthly - b.ownership.totalMonthly,
        );
        break;
      case "emi_asc":
        list.sort((a, b) => a.ownership.emi - b.ownership.emi);
        break;
      case "value":
        list.sort((a, b) => {
          const valueA = a.score / Math.max(a.ownership.totalMonthly, 1);
          const valueB = b.score / Math.max(b.ownership.totalMonthly, 1);
          return valueB - valueA;
        });
        break;
      default:
        list.sort((a, b) => b.score - a.score);
    }
    return list;
  }, [ranked, filters]);

  if (!hydrated || !profileReady) {
    return (
      <p className="text-sm text-muted-foreground">Loading your budget…</p>
    );
  }

  if (!hasProfile) {
    return null;
  }

  const emergencyTarget = resolveEmergencyFundTarget(profile);
  const cityName =
    getCityById(profile.preferredCityId)?.name ?? profile.preferredCityId;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            What can I afford?
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Your car budget
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Estimated ownership for {cityName} — EMI, fuel, insurance,
            maintenance and FASTag — not purchase price alone.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/preferences")}>
            Edit preferences
          </Button>
          <Button variant="outline" onClick={() => router.push("/onboarding")}>
            Edit profile
          </Button>
        </div>
      </div>

      <BudgetSummary analysis={analysis} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <AffordabilityRange analysis={analysis} />
          <div className="rounded-xl border border-border bg-white px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Cars matching your profile
            </p>
            <p className="font-display text-4xl font-semibold tabular-nums">
              {matchingProfile.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Comfortable or stretch · of {ranked.length} in catalogue
            </p>
          </div>
        </div>
        <IncomeAllocation profile={profile} analysis={analysis} />
      </div>

      {analysis.emergencyFundWarning ? (
        <EmergencyFundWarning
          remaining={analysis.remainingSavingsAfterDownPayment}
          target={emergencyTarget}
        />
      ) : null}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Cars matching your profile
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked by total monthly ownership, preferences and emergency
              savings — not sticker price alone.
            </p>
          </div>
          <p className="text-sm tabular-nums text-muted-foreground">
            {visible.length} shown
          </p>
        </div>
        <ResultsFilters
          value={filters}
          onChange={setFilters}
          bodyTypes={bodyTypes}
          fuels={fuels}
          transmissions={transmissions}
          brands={brands}
          seatOptions={seatOptions}
        />
        {visible.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 px-5 py-8 text-center">
            <p className="font-medium">No cars match these filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing filters or{" "}
              <Link href="/cars" className="text-accent underline">
                browse all cars
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((match) => (
              <CarCard
                key={match.carId}
                car={match.car}
                onRoadPrice={match.onRoadPrice}
                ownership={match.ownership}
                status={match.status}
                reasons={match.reasons}
                consider={match.consider}
                moneyLeftAfterCar={match.moneyLeftAfterCar}
              />
            ))}
          </div>
        )}
      </section>

      <DataAssumptions />
      <Disclaimer />
    </div>
  );
}
