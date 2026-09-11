"use client";

import { Select } from "@/components/ui/select";
import type { AffordabilityStatus } from "@/types/finance";

export type ResultsSort =
  | "score"
  | "price_asc"
  | "monthly_asc"
  | "emi_asc"
  | "value";

export interface ResultsFilterState {
  status: AffordabilityStatus | "all";
  sort: ResultsSort;
  bodyType: string;
  fuel: string;
  transmission: string;
  brand: string;
  seats: string;
}

export function ResultsFilters({
  value,
  onChange,
  bodyTypes,
  fuels,
  transmissions,
  brands,
  seatOptions,
}: {
  value: ResultsFilterState;
  onChange: (next: ResultsFilterState) => void;
  bodyTypes: string[];
  fuels: string[];
  transmissions: string[];
  brands: string[];
  seatOptions: number[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <label className="space-y-1.5 text-sm">
        <span className="font-medium">Affordability</span>
        <Select
          value={value.status}
          onChange={(e) =>
            onChange({
              ...value,
              status: e.target.value as ResultsFilterState["status"],
            })
          }
        >
          <option value="all">All statuses</option>
          <option value="comfortable">Comfortable only</option>
          <option value="stretch">Stretch</option>
          <option value="not_recommended">Not recommended</option>
        </Select>
      </label>
      <label className="space-y-1.5 text-sm">
        <span className="font-medium">Sort by</span>
        <Select
          value={value.sort}
          onChange={(e) =>
            onChange({
              ...value,
              sort: e.target.value as ResultsSort,
            })
          }
        >
          <option value="score">Best match</option>
          <option value="monthly_asc">Lowest monthly cost</option>
          <option value="price_asc">Lowest price</option>
          <option value="value">Best value</option>
          <option value="emi_asc">Lowest EMI</option>
        </Select>
      </label>
      <label className="space-y-1.5 text-sm">
        <span className="font-medium">Brand</span>
        <Select
          value={value.brand}
          onChange={(e) => onChange({ ...value, brand: e.target.value })}
        >
          <option value="all">All</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </label>
      <label className="space-y-1.5 text-sm">
        <span className="font-medium">Body type</span>
        <Select
          value={value.bodyType}
          onChange={(e) => onChange({ ...value, bodyType: e.target.value })}
        >
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
        <Select
          value={value.fuel}
          onChange={(e) => onChange({ ...value, fuel: e.target.value })}
        >
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
          value={value.transmission}
          onChange={(e) =>
            onChange({ ...value, transmission: e.target.value })
          }
        >
          <option value="all">All</option>
          {transmissions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </label>
      <label className="space-y-1.5 text-sm">
        <span className="font-medium">Seats</span>
        <Select
          value={value.seats}
          onChange={(e) => onChange({ ...value, seats: e.target.value })}
        >
          <option value="all">All</option>
          {seatOptions.map((s) => (
            <option key={s} value={String(s)}>
              {s}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
