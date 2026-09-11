"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CurrencyInput } from "@/components/finance/CurrencyInput";
import { Disclaimer } from "@/components/finance/Disclaimer";
import { ThemeSwitch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/AppProvider";
import { cities } from "@/data/cities";
import { getOnRoadPrice } from "@/lib/cars/pricing";
import { getCarById } from "@/lib/cars/repository";
import { formatINR, formatINRCompact } from "@/lib/formatters/currency";
import { LOAN_TENURE_OPTIONS } from "@/lib/affordability";

export default function ProfilePage() {
  const {
    profile,
    updateProfile,
    hasProfile,
    savedIds,
    clearSaved,
    clearAllData,
    hydrated,
  } = useApp();

  const savedCars = useMemo(
    () =>
      savedIds
        .map((id) => getCarById(id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    [savedIds],
  );

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your financial profile stays on this device.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Appearance</CardTitle>
          <ThemeSwitch />
        </CardHeader>
      </Card>

      {!hasProfile ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-muted-foreground">
              No saved profile yet. Complete onboarding to unlock personalised
              results.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm font-medium text-accent-foreground"
            >
              Start onboarding
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Financial profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CurrencyInput
              label="Monthly income"
              value={profile.monthlyIncome}
              onChange={(v) => updateProfile({ monthlyIncome: v })}
            />
            <CurrencyInput
              label="Monthly expenses"
              value={profile.monthlyExpenses}
              onChange={(v) => updateProfile({ monthlyExpenses: v })}
            />
            <CurrencyInput
              label="Savings"
              value={profile.savings}
              onChange={(v) => updateProfile({ savings: v })}
            />
            <CurrencyInput
              label="Down payment"
              value={profile.downPayment}
              onChange={(v) => updateProfile({ downPayment: v })}
            />
            <CurrencyInput
              label="Emergency fund target"
              value={profile.emergencyFundTarget}
              onChange={(v) => updateProfile({ emergencyFundTarget: v })}
            />
            <div className="space-y-1.5">
              <Label htmlFor="city">Preferred city</Label>
              <Select
                id="city"
                value={profile.preferredCityId}
                onChange={(e) =>
                  updateProfile({ preferredCityId: e.target.value })
                }
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tenure">Loan tenure</Label>
              <Select
                id="tenure"
                value={String(profile.loanTenureYears)}
                onChange={(e) =>
                  updateProfile({
                    loanTenureYears: Number(
                      e.target.value,
                    ) as typeof profile.loanTenureYears,
                  })
                }
              >
                {LOAN_TENURE_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y} years
                  </option>
                ))}
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Car loan interest {Number(profile.interestRate).toFixed(2)}% p.a. ·{" "}
              {profile.monthlyKm} km/month · city{" "}
              {profile.preferredCityId}.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/onboarding"
                className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted"
              >
                Full edit
              </Link>
              <Link
                href="/results"
                className="inline-flex h-11 items-center rounded-xl bg-accent px-4 text-sm font-medium text-accent-foreground"
              >
                View results
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Saved cars</CardTitle>
          {savedCars.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearSaved}>
              Clear
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {savedCars.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved cars yet.</p>
          ) : (
            <ul className="space-y-3">
              {savedCars.map((car) => (
                <li key={car.id}>
                  <Link
                    href={`/cars/${car.id}`}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2 hover:bg-muted/40"
                  >
                    <span>
                      {car.brand} {car.model}
                    </span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {formatINRCompact(
                        getOnRoadPrice(car, profile.preferredCityId).price,
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Clears profile, preferences, saved cars and compare list from this
            browser.
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.confirm("Clear all CarWise data on this device?")
              ) {
                clearAllData();
              }
            }}
          >
            Clear all data
          </Button>
          <p className="text-xs text-muted-foreground">
            Sample income shown for reference only:{" "}
            {formatINR(profile.monthlyIncome)}/mo
          </p>
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  );
}
