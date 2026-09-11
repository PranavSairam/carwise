"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppProvider";
import { getCarById } from "@/lib/cars/repository";
import { cn } from "@/lib/utils";

export function CompareBar({ className }: { className?: string }) {
  const { compareIds, removeFromCompare, clearCompare, hydrated } = useApp();

  if (!hydrated || compareIds.length === 0) {
    return null;
  }

  const cars = compareIds
    .map((id) => getCarById(id))
    .filter((car): car is NonNullable<typeof car> => Boolean(car));

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md md:bottom-0",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <p className="text-sm font-medium">
          Compare ({cars.length}/{4})
        </p>
        <ul className="flex flex-1 flex-wrap gap-2">
          {cars.map((car) => (
            <li
              key={car.id}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
            >
              {car.brand} {car.model}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-background"
                aria-label={`Remove ${car.model} from compare`}
                onClick={() => removeFromCompare(car.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            Clear
          </Button>
          <Link
            href="/compare"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-xs font-medium text-accent-foreground"
          >
            Open compare
          </Link>
        </div>
      </div>
    </div>
  );
}
