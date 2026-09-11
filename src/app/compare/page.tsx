"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AffordabilityBadge } from "@/components/finance/AffordabilityBadge";
import { Disclaimer } from "@/components/finance/Disclaimer";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppProvider";
import {
  analyzeAffordability,
  calculateFuelCost,
  calculateTotalMonthlyCarCost,
  getAffordabilityStatus,
  getSafeDownPayment,
} from "@/lib/affordability";
import { getOnRoadPrice } from "@/lib/cars/pricing";
import { getCarById } from "@/lib/cars/repository";
import { formatINR, formatINRCompact } from "@/lib/formatters/currency";
import { cn } from "@/lib/utils";
import type { Car } from "@/types/car";
import type { OwnershipCostBreakdown } from "@/types/finance";

interface CompareRow {
  car: Car;
  onRoadPrice: number;
  ownership: OwnershipCostBreakdown;
  status: ReturnType<typeof getAffordabilityStatus> | null;
  mileage: number;
  seats: number;
  fuel: string;
  power: number;
}

function bestIndex(values: number[], prefer: "min" | "max"): number | null {
  if (values.length === 0) return null;
  let best = 0;
  for (let i = 1; i < values.length; i++) {
    if (prefer === "min" ? values[i]! < values[best]! : values[i]! > values[best]!) {
      best = i;
    }
  }
  return best;
}

export default function ComparePage() {
  const {
    compareIds,
    clearCompare,
    removeFromCompare,
    profile,
    hasProfile,
    hydrated,
  } = useApp();

  const analysis = useMemo(
    () => (hasProfile ? analyzeAffordability(profile) : null),
    [hasProfile, profile],
  );

  const rows = useMemo(() => {
    const downPayment = hasProfile ? getSafeDownPayment(profile) : 0;
    return compareIds
      .map((id) => getCarById(id))
      .filter((c): c is Car => Boolean(c))
      .map((car): CompareRow => {
        const onRoadPrice = getOnRoadPrice(car, profile.preferredCityId).price;
        const fuel = calculateFuelCost(
          {
            fuel: car.fuel,
            mileage: car.mileage,
            fuelEfficiencyUnit: car.fuelEfficiencyUnit,
            electricityRatePerKwh: car.electricityRatePerKwh,
          },
          profile.monthlyKm || 1000,
          profile.cityHighwaySplit,
        );
        const ownership = calculateTotalMonthlyCarCost({
          onRoadPrice,
          downPayment: hasProfile ? downPayment : Math.round(onRoadPrice * 0.2),
          annualInterestRate: profile.interestRate,
          loanTenureYears: profile.loanTenureYears,
          fuel,
          insuranceAnnual: car.insuranceAnnualEstimate,
          maintenanceMonthly: car.maintenanceMonthlyEstimate,
          tyresConsumablesMonthly: car.tyreConsumablesMonthlyEstimate,
        });
        const status = analysis
          ? getAffordabilityStatus(
              ownership.totalMonthly,
              analysis.safeMonthlyBudget,
              analysis.stretchMonthlyBudget,
            )
          : null;
        return {
          car,
          onRoadPrice,
          ownership,
          status,
          mileage: car.mileage,
          seats: car.seats,
          fuel: car.fuel,
          power: car.powerBhp ?? 0,
        };
      });
  }, [compareIds, profile, hasProfile, analysis]);

  const highlights = {
    price: bestIndex(
      rows.map((r) => r.onRoadPrice),
      "min",
    ),
    monthly: bestIndex(
      rows.map((r) => r.ownership.totalMonthly),
      "min",
    ),
    mileage: bestIndex(
      rows.map((r) => r.mileage),
      "max",
    ),
    power: bestIndex(
      rows.map((r) => r.power),
      "max",
    ),
  };

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-4 py-12 text-center">
        <h1 className="font-display text-3xl font-semibold">Compare cars</h1>
        <p className="text-muted-foreground">
          Select up to 4 cars from results or browse to compare side by side.
        </p>
        <Link
          href="/cars"
          className="inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm font-medium text-accent-foreground"
        >
          Browse cars
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Compare</h1>
          <p className="text-muted-foreground">
            Best values in each row are highlighted.
          </p>
        </div>
        <Button variant="outline" onClick={clearCompare}>
          Clear all
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="p-3 font-medium">Spec</th>
              {rows.map((row) => (
                <th key={row.car.id} className="p-3 font-medium">
                  <div className="space-y-1">
                    <Link
                      href={`/cars/${row.car.id}`}
                      className="hover:text-accent"
                    >
                      {row.car.brand} {row.car.model}
                    </Link>
                    <p className="text-xs font-normal text-muted-foreground">
                      {row.car.variant}
                    </p>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline"
                      onClick={() => removeFromCompare(row.car.id)}
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <CompareMetric
              label="Estimated on-road"
              values={rows.map((r) => formatINRCompact(r.onRoadPrice))}
              best={highlights.price}
            />
            <CompareMetric
              label="EMI"
              values={rows.map((r) => formatINR(r.ownership.emi))}
              best={highlights.monthly}
            />
            <CompareMetric
              label="Monthly ownership"
              values={rows.map((r) => formatINR(r.ownership.totalMonthly))}
              best={highlights.monthly}
            />
            <CompareMetric
              label="Fuel / mo"
              values={rows.map((r) => formatINR(r.ownership.fuel))}
              best={bestIndex(
                rows.map((r) => r.ownership.fuel),
                "min",
              )}
            />
            <CompareMetric
              label="Mileage"
              values={rows.map((r) => String(r.mileage))}
              best={highlights.mileage}
            />
            <CompareMetric
              label="Power (bhp)"
              values={rows.map((r) => (r.power ? String(r.power) : "—"))}
              best={highlights.power}
            />
            <CompareMetric
              label="Seats"
              values={rows.map((r) => String(r.seats))}
            />
            <CompareMetric
              label="Fuel type"
              values={rows.map((r) => r.fuel)}
            />
            <tr className="border-b border-border">
              <td className="p-3 text-muted-foreground">Affordability</td>
              {rows.map((row) => (
                <td key={row.car.id} className="p-3">
                  {row.status ? (
                    <AffordabilityBadge status={row.status} />
                  ) : (
                    "—"
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <Disclaimer />
    </div>
  );
}

function CompareMetric({
  label,
  values,
  best,
}: {
  label: string;
  values: string[];
  best?: number | null;
}) {
  return (
    <tr className="border-b border-border">
      <td className="p-3 text-muted-foreground">{label}</td>
      {values.map((value, i) => (
        <td
          key={`${label}-${i}`}
          className={cn(
            "p-3 tabular-nums",
            best === i && "bg-accent/10 font-semibold text-accent",
          )}
        >
          {value}
        </td>
      ))}
    </tr>
  );
}
