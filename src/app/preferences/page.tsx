"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Disclaimer } from "@/components/finance/Disclaimer";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppProvider";
import { brands } from "@/data/brands";
import type {
  BodyType,
  FuelType,
  PurchaseType,
  TransmissionType,
} from "@/types/car";
import type { SeatingPreference } from "@/types/preferences";
import { cn } from "@/lib/utils";

const BODY_TYPES: BodyType[] = [
  "Hatchback",
  "Sedan",
  "SUV",
  "MUV",
  "MPV",
  "Luxury",
];
const FUELS: FuelType[] = ["Petrol", "Diesel", "CNG", "Hybrid", "EV"];
const TRANSMISSIONS: TransmissionType[] = [
  "Manual",
  "Automatic",
  "AMT",
  "DCT",
  "CVT",
];
const SEATING: SeatingPreference[] = ["4/5", "6/7", "8+"];
const PURCHASE: PurchaseType[] = ["New", "Used"];

function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
  getLabel,
  featured,
}: {
  label: string;
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
  getLabel?: (value: T) => string;
  featured?: (value: T) => boolean;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          const isFeatured = featured?.(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm transition-colors",
                active
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-card hover:bg-muted",
                isFeatured && !active && "ring-1 ring-accent/30",
              )}
            >
              {getLabel ? getLabel(option) : option}
              {isFeatured ? (
                <span className="ml-1 text-[10px] uppercase tracking-wide opacity-70">
                  featured
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function PreferencesPage() {
  const router = useRouter();
  const { preferences, setPreferences, hasProfile, hydrated } = useApp();

  useEffect(() => {
    if (hydrated && !hasProfile) {
      router.replace("/onboarding");
    }
  }, [hydrated, hasProfile, router]);

  const toggle = <K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K] extends (infer U)[] ? U : never,
  ) => {
    const current = preferences[key] as unknown as string[];
    const next = current.includes(value as string)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setPreferences({ ...preferences, [key]: next });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Car preferences</h1>
        <p className="text-muted-foreground">
          Optional filters — leave empty to see all matches within budget.
          Volkswagen is featured.
        </p>
      </div>

      <ChipGroup
        label="Body type"
        options={BODY_TYPES}
        selected={preferences.bodyTypes}
        onToggle={(v) => toggle("bodyTypes", v)}
      />
      <ChipGroup
        label="Fuel"
        options={FUELS}
        selected={preferences.fuels}
        onToggle={(v) => toggle("fuels", v)}
      />
      <ChipGroup
        label="Transmission"
        options={TRANSMISSIONS}
        selected={preferences.transmissions}
        onToggle={(v) => toggle("transmissions", v)}
      />
      <ChipGroup
        label="Seating"
        options={SEATING}
        selected={preferences.seating}
        onToggle={(v) => toggle("seating", v)}
      />
      <ChipGroup
        label="Purchase type"
        options={PURCHASE}
        selected={preferences.purchaseTypes}
        onToggle={(v) => toggle("purchaseTypes", v)}
      />
      <ChipGroup
        label="Brands"
        options={brands.map((b) => b.id)}
        selected={preferences.brandIds}
        onToggle={(v) => toggle("brandIds", v)}
        getLabel={(id) => brands.find((b) => b.id === id)?.name ?? id}
        featured={(id) => Boolean(brands.find((b) => b.id === id)?.featured)}
      />

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/onboarding")}
        >
          Back
        </Button>
        <Button className="flex-1" onClick={() => router.push("/results")}>
          See my cars
        </Button>
      </div>
      <Disclaimer />
    </div>
  );
}
