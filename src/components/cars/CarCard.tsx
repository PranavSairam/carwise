"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Fuel, GitCompareArrows, Gauge, Heart } from "lucide-react";
import { AffordabilityBadge } from "@/components/finance/AffordabilityBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppProvider";
import { resolveCarImage } from "@/lib/cars/images";
import {
  formatINR,
  formatINRCompact,
  formatINRMonth,
} from "@/lib/formatters/currency";
import { formatFuelLabel, formatMileage } from "@/lib/formatters/mileage";
import type { Car } from "@/types/car";
import type {
  AffordabilityStatus,
  OwnershipCostBreakdown,
} from "@/types/finance";
import { cn } from "@/lib/utils";

export interface CarCardProps {
  car: Car;
  onRoadPrice: number;
  ownership?: OwnershipCostBreakdown;
  status?: AffordabilityStatus;
  reasons?: string[];
  consider?: string[];
  moneyLeftAfterCar?: number;
  className?: string;
  compact?: boolean;
  highlight?: boolean;
}

export function CarCard({
  car,
  onRoadPrice,
  ownership,
  status,
  reasons,
  consider,
  moneyLeftAfterCar,
  className,
  compact = false,
  highlight = false,
}: CarCardProps) {
  const { toggleSaved, isSaved, toggleCompare, isComparing } = useApp();
  const [imgSrc, setImgSrc] = useState(() => resolveCarImage(car));
  const saved = isSaved(car.id);
  const comparing = isComparing(car.id);

  useEffect(() => {
    setImgSrc(resolveCarImage(car));
  }, [car]);

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border bg-white shadow-none transition-shadow motion-safe:hover:shadow-sm",
        highlight && "ring-1 ring-accent/40",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
        <Image
          src={imgSrc}
          alt={`${car.brand} ${car.model} ${car.variant}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center"
          unoptimized
          onError={() => setImgSrc("/cars/photos/virtus.jpg")}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">
            {car.brand}
          </p>
          <p className="font-display text-lg font-semibold leading-tight text-white">
            {car.model}
          </p>
        </div>
        <div className="absolute right-2 top-2 flex gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 border-0 bg-white/90 text-foreground shadow-none hover:bg-white"
            aria-label={saved ? "Remove from saved" : "Save car"}
            onClick={() => toggleSaved(car.id)}
          >
            <Heart
              className={cn("h-4 w-4", saved && "fill-accent text-accent")}
            />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 border-0 bg-white/90 text-foreground shadow-none hover:bg-white"
            aria-label={comparing ? "Remove from compare" : "Add to compare"}
            onClick={() => toggleCompare(car.id)}
          >
            <GitCompareArrows
              className={cn("h-4 w-4", comparing && "text-accent")}
            />
          </Button>
        </div>
        <div className="absolute left-2 top-2">
          {status ? <AffordabilityBadge status={status} /> : null}
        </div>
      </div>
      <CardContent className="space-y-3 pt-4">
        <div>
          <h3 className="text-sm font-medium leading-snug text-muted-foreground">
            {car.variant}
          </h3>
          <p className="mt-1 text-base font-semibold tabular-nums tracking-tight">
            {formatINRCompact(onRoadPrice)}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              estimated on-road
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            Ex-showroom {formatINRCompact(car.exShowroomPrice)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <span className="text-muted-foreground">Mileage</span>
            <span className="font-semibold tabular-nums">{formatMileage(car)}</span>
          </span>
          {ownership ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5">
              <Fuel className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              <span className="text-muted-foreground">
                {formatFuelLabel(car.fuel)}
              </span>
              <span className="font-semibold tabular-nums">
                {formatINR(ownership.fuel)}/mo
              </span>
            </span>
          ) : null}
        </div>

        {!compact && ownership && ownership.totalMonthly > 0 ? (
          <dl className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-3 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">EMI</dt>
              <dd className="font-medium tabular-nums">{formatINR(ownership.emi)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Fuel / electricity</dt>
              <dd className="font-medium tabular-nums">{formatINR(ownership.fuel)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Insurance</dt>
              <dd className="font-medium tabular-nums">
                {formatINR(ownership.insurance)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Maintenance</dt>
              <dd className="font-medium tabular-nums">
                {formatINR(ownership.maintenance + ownership.tyresConsumables)}
              </dd>
            </div>
            {ownership.fastag !== undefined && ownership.fastag > 0 ? (
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">FASTag / tolls</dt>
                <dd className="font-medium tabular-nums">
                  {formatINR(ownership.fastag)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-2 border-t border-border pt-1.5">
              <dt className="font-medium text-foreground">Total monthly</dt>
              <dd className="font-semibold tabular-nums text-accent">
                {formatINRMonth(ownership.totalMonthly)}
              </dd>
            </div>
            {moneyLeftAfterCar !== undefined ? (
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Money left after car</dt>
                <dd className="font-medium tabular-nums">
                  {formatINR(moneyLeftAfterCar)}/mo
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {reasons && reasons.length > 0 && !compact ? (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Why this car fits you
            </p>
            <ul className="space-y-1 text-xs text-foreground/80">
              {reasons.slice(0, 3).map((reason) => (
                <li key={reason}>✓ {reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {consider && consider.length > 0 && !compact ? (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              What you should consider
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {consider.slice(0, 2).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <Link
          href={`/cars/${car.id}`}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted"
        >
          View details
        </Link>
      </CardContent>
    </Card>
  );
}
