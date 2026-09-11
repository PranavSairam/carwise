"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { OwnershipBreakdownChart } from "@/components/charts/OwnershipBreakdownChart";
import { AffordabilityBadge } from "@/components/finance/AffordabilityBadge";
import { Disclaimer } from "@/components/finance/Disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useApp } from "@/context/AppProvider";
import {
  analyzeAffordability,
  calculateDisposableIncome,
  calculateFuelCost,
  calculateTotalMonthlyCarCost,
  getAffordabilityStatus,
  LOAN_TENURE_OPTIONS,
  rankCars,
} from "@/lib/affordability";
import { DataAssumptions } from "@/components/finance/DataAssumptions";
import { getOnRoadPrice } from "@/lib/cars/pricing";
import { getAllCars } from "@/lib/cars/repository";
import { resolveCarImage } from "@/lib/cars/images";
import {
  formatINR,
  formatINRCompact,
  formatINRMonth,
} from "@/lib/formatters/currency";
import { formatMileage } from "@/lib/formatters/mileage";
import type { Car } from "@/types/car";

export function CarDetailClient({ car }: { car: Car }) {
  const {
    profile,
    hasProfile,
    profileReady,
    preferences,
    toggleSaved,
    isSaved,
    toggleCompare,
    isComparing,
  } = useApp();

  const baseOnRoad = getOnRoadPrice(car, profile.preferredCityId);

  const [downPayment, setDownPayment] = useState(() =>
    Math.round(baseOnRoad.price * 0.2),
  );
  const [tenure, setTenure] = useState(profile.loanTenureYears);
  const [interest, setInterest] = useState(profile.interestRate);
  const [monthlyKm, setMonthlyKm] = useState(profile.monthlyKm);
  const [simulatorSynced, setSimulatorSynced] = useState(false);

  useEffect(() => {
    if (!profileReady || simulatorSynced) return;
    if (hasProfile) {
      setDownPayment(
        Math.min(profile.downPayment, Math.max(0, baseOnRoad.price)),
      );
      setTenure(profile.loanTenureYears);
      setInterest(profile.interestRate);
      setMonthlyKm(profile.monthlyKm);
    }
    setSimulatorSynced(true);
  }, [
    profileReady,
    hasProfile,
    profile,
    baseOnRoad.price,
    simulatorSynced,
  ]);

  const ownership = useMemo(() => {
    const fuel = calculateFuelCost(
      {
        fuel: car.fuel,
        mileage: car.mileage,
        fuelEfficiencyUnit: car.fuelEfficiencyUnit,
        electricityRatePerKwh: car.electricityRatePerKwh,
      },
      monthlyKm,
      profile.cityHighwaySplit,
    );
    return calculateTotalMonthlyCarCost({
      onRoadPrice: baseOnRoad.price,
      downPayment,
      annualInterestRate: interest,
      loanTenureYears: tenure,
      fuel,
      insuranceAnnual: car.insuranceAnnualEstimate,
      maintenanceMonthly: car.maintenanceMonthlyEstimate,
      tyresConsumablesMonthly: car.tyreConsumablesMonthlyEstimate,
    });
  }, [
    car,
    baseOnRoad.price,
    downPayment,
    interest,
    tenure,
    monthlyKm,
    profile.cityHighwaySplit,
  ]);

  const analysis = useMemo(
    () => (hasProfile ? analyzeAffordability(profile) : null),
    [hasProfile, profile],
  );

  const status = analysis
    ? getAffordabilityStatus(
        ownership.totalMonthly,
        analysis.safeMonthlyBudget,
        analysis.stretchMonthlyBudget,
      )
    : undefined;

  const disposable = hasProfile ? calculateDisposableIncome(profile) : 0;
  const afterBuying = Math.max(0, disposable - ownership.totalMonthly);

  const cashflowData = [
    { name: "Disposable", value: Math.round(disposable) },
    { name: "Car cost", value: Math.round(ownership.totalMonthly) },
    { name: "After buying", value: Math.round(afterBuying) },
  ];

  const related = useMemo(() => {
    if (!hasProfile || !analysis) {
      const peers = getAllCars()
        .filter((c) => c.id !== car.id && c.brandId === car.brandId)
        .slice(0, 3);
      return { peers, cheaper: [] as Car[], upgrade: [] as Car[] };
    }
    const ranked = rankCars(getAllCars(), profile, preferences, analysis, {
      onRoadPrice: (c) => getOnRoadPrice(c, profile.preferredCityId).price,
    });
    const byId = new Map(getAllCars().map((c) => [c.id, c]));
    const price = baseOnRoad.price;
    const similar = ranked
      .filter((r) => r.carId !== car.id)
      .map((r) => byId.get(r.carId))
      .filter((c): c is Car => Boolean(c));

    return {
      peers: similar.slice(0, 3),
      cheaper: similar
        .filter(
          (c) =>
            getOnRoadPrice(c, profile.preferredCityId).price < price * 0.92,
        )
        .slice(0, 2),
      upgrade: similar
        .filter(
          (c) =>
            getOnRoadPrice(c, profile.preferredCityId).price > price * 1.08,
        )
        .slice(0, 2),
    };
  }, [car, hasProfile, analysis, profile, preferences, baseOnRoad.price]);

  return (
    <div className="space-y-8 pb-10">
      <section className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-900 sm:w-80">
            <Image
              src={resolveCarImage(car)}
              alt={`${car.brand} ${car.model}`}
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover object-center"
              unoptimized
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {car.brand}
            </p>
            <h1 className="font-display text-3xl font-semibold">
              {car.model}{" "}
              <span className="text-xl font-normal text-muted-foreground">
                {car.variant}
              </span>
            </h1>
            <p className="text-lg font-medium tabular-nums">
              {formatINRCompact(baseOnRoad.price)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                {baseOnRoad.label}
              </span>
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              Ex-showroom {formatINRCompact(car.exShowroomPrice)}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{car.bodyType}</span>·<span>{car.fuel}</span>·
              <span>{car.transmission}</span>·<span>{car.seats} seats</span>·
              <span className="font-medium text-foreground">
                Mileage {formatMileage(car)}
              </span>
              ·
              <span className="font-medium text-foreground">
                Est. fuel {formatINR(ownership.fuel)}/mo
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSaved(car.id)}
              >
                {isSaved(car.id) ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleCompare(car.id)}
              >
                {isComparing(car.id) ? "In compare" : "Compare"}
              </Button>
              {!hasProfile ? (
                <Link
                  href="/onboarding"
                  className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-xs font-medium text-accent-foreground"
                >
                  Build profile to check affordability
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {hasProfile && status ? (
        <Card>
          <CardHeader>
            <CardTitle>Can you afford it?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AffordabilityBadge status={status} showHint />
            <p className="text-2xl font-semibold tabular-nums text-accent">
              {formatINRMonth(ownership.totalMonthly)}
            </p>
            <p className="text-sm text-muted-foreground">
              Comfortable budget {formatINR(analysis!.safeMonthlyBudget)} ·
              stretch {formatINR(analysis!.stretchMonthlyBudget)}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ownership breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <OwnershipBreakdownChart ownership={ownership} />
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">EMI</dt>
                <dd className="font-medium tabular-nums">
                  {formatINR(ownership.emi)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fuel / electricity</dt>
                <dd className="font-medium tabular-nums">
                  {formatINR(ownership.fuel)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Insurance</dt>
                <dd className="font-medium tabular-nums">
                  {formatINR(ownership.insurance)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Maintenance</dt>
                <dd className="font-medium tabular-nums">
                  {formatINR(ownership.maintenance)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tyres / consumables</dt>
                <dd className="font-medium tabular-nums">
                  {formatINR(ownership.tyresConsumables)}
                </dd>
              </div>
              {ownership.fastag !== undefined && ownership.fastag > 0 ? (
                <div>
                  <dt className="text-muted-foreground">FASTag / tolls</dt>
                  <dd className="font-medium tabular-nums">
                    {formatINR(ownership.fastag)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>

        {hasProfile ? (
          <Card>
            <CardHeader>
              <CardTitle>Finances after buying</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full">
                <ResponsiveContainer>
                  <BarChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} width={56} />
                    <Tooltip
                      formatter={(value) =>
                        formatINR(
                          typeof value === "number" ? value : Number(value) || 0,
                        )
                      }
                    />
                    <Bar dataKey="value" fill="#0D9488" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What-if simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Slider
            id="dp"
            label="Down payment"
            min={0}
            max={Math.max(baseOnRoad.price, downPayment)}
            step={10000}
            value={downPayment}
            valueLabel={formatINR(downPayment)}
            onChange={(e) => setDownPayment(Number(e.target.value))}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">Tenure: {tenure} years</p>
            <div className="flex flex-wrap gap-2">
              {LOAN_TENURE_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setTenure(y)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    tenure === y
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border"
                  }`}
                >
                  {y}y
                </button>
              ))}
            </div>
          </div>
          <Slider
            id="interest"
            label="Car loan interest rate"
            min={0}
            max={20}
            step={0.05}
            value={interest}
            valueLabel={`${Number(interest).toFixed(2)}% p.a.`}
            onChange={(e) => setInterest(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            7.45% is used as the default planning rate. Actual rates vary by
            lender, credit profile, loan amount, tenure and offers.
          </p>
          <Slider
            id="km"
            label="Monthly km"
            min={0}
            max={5000}
            step={50}
            value={monthlyKm}
            valueLabel={`${monthlyKm} km`}
            onChange={(e) => setMonthlyKm(Number(e.target.value))}
          />
          <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm">
            Updated ownership:{" "}
            <strong className="tabular-nums text-accent">
              {formatINRMonth(ownership.totalMonthly)}
            </strong>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Why it fits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              {car.fuel} {car.bodyType.toLowerCase()} with estimated{" "}
              {car.mileage}{" "}
              {car.fuelEfficiencyUnit === "kmpl" ? "kmpl" : "km/kWh"}.
            </p>
            {status === "comfortable" ? (
              <p>Monthly ownership sits within your comfortable budget.</p>
            ) : status === "stretch" ? (
              <p>Feasible on stretch budget — leave buffer for surprises.</p>
            ) : (
              <p>
                Review the simulator or a cheaper variant before committing.
              </p>
            )}
            <p className="text-xs">
              Data status:{" "}
              {car.dataStatus ??
                (car.dataConfidence === "verified" ? "verified" : "estimated")}{" "}
              · Updated {car.lastUpdated}
              {car.source ? ` · ${car.source}` : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What to consider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Estimated on-road includes RTO/registration, insurance and FASTag
              allowances — not a live dealer quote.
            </p>
            <p>Fuel and maintenance rise with kilometres and city traffic.</p>
            <p>Keep an emergency fund intact after the down payment.</p>
          </CardContent>
        </Card>
      </div>

      <RelatedSection
        title={hasProfile ? "Similar matches" : "More from this brand"}
        cars={related.peers}
        cityId={profile.preferredCityId}
      />
      {related.cheaper.length > 0 ? (
        <RelatedSection
          title="Cheaper alternatives"
          cars={related.cheaper}
          cityId={profile.preferredCityId}
        />
      ) : null}
      {related.upgrade.length > 0 ? (
        <RelatedSection
          title="Upgrade options"
          cars={related.upgrade}
          cityId={profile.preferredCityId}
        />
      ) : null}

      <DataAssumptions />
      <Disclaimer />
    </div>
  );
}

function RelatedSection({
  title,
  cars,
  cityId,
}: {
  title: string;
  cars: Car[];
  cityId: string;
}) {
  if (cars.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {cars.map((c) => (
          <li key={c.id}>
            <Link
              href={`/cars/${c.id}`}
              className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
            >
              <p className="text-xs text-muted-foreground">{c.brand}</p>
              <p className="font-medium">
                {c.model} {c.variant}
              </p>
              <p className="mt-1 text-sm tabular-nums text-accent">
                {formatINRCompact(getOnRoadPrice(c, cityId).price)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
