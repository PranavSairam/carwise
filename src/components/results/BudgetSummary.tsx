import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR, formatINRCompact } from "@/lib/formatters/currency";
import type { AffordabilityResult, FinancialComfort } from "@/types/finance";
import { cn } from "@/lib/utils";

const COMFORT_COPY: Record<
  FinancialComfort,
  { label: string; hint: string; className: string }
> = {
  high: {
    label: "High",
    hint: "Healthy breathing room after recommended ownership",
    className: "text-emerald-700",
  },
  moderate: {
    label: "Moderate",
    hint: "Manageable, with less flexibility",
    className: "text-amber-700",
  },
  low: {
    label: "Low",
    hint: "Limited room after estimated car costs",
    className: "text-rose-700",
  },
};

export function BudgetSummary({ analysis }: { analysis: AffordabilityResult }) {
  const comfort = COMFORT_COPY[analysis.financialComfort];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-none sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your comfortable car budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {formatINRCompact(analysis.comfortablePriceRange.min)}–
              {formatINRCompact(analysis.comfortablePriceRange.max)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Estimated on-road · stretch up to{" "}
              {formatINRCompact(analysis.stretchPriceRange.max)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recommended monthly ownership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-semibold tabular-nums text-accent">
              {formatINR(analysis.safeMonthlyBudget)}
              <span className="text-base font-medium text-muted-foreground">
                /mo
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ~20% of disposable income
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Money left after car
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-semibold tabular-nums">
              {formatINR(analysis.moneyLeftAfterRecommendedOwnership)}
              <span className="text-base font-medium text-muted-foreground">
                /mo
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              After recommended ownership budget
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Financial comfort
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "font-display text-3xl font-semibold",
                comfort.className,
              )}
            >
              {comfort.label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{comfort.hint}</p>
            <p className="mt-2 text-[11px] text-muted-foreground/80">
              Not a credit score — estimated breathing room only.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
