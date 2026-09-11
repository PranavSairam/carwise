"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Income",
  "Expenses",
  "Savings",
  "Safe budget",
  "Cars",
] as const;

export function BudgetFlowVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 sm:gap-3",
        className,
      )}
      aria-label="Budget flow from income to cars"
    >
      {STEPS.map((step, index) => (
        <div key={step} className="flex items-center gap-2 sm:gap-3">
          <div
            className={cn(
              "rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium shadow-sm",
              "motion-safe:animate-[fade-up_0.5s_ease-out_both]",
            )}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {step}
          </div>
          {index < STEPS.length - 1 ? (
            <ArrowRight
              className="hidden h-4 w-4 text-accent sm:block"
              aria-hidden
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
