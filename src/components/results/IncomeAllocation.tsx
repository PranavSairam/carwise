import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/formatters/currency";
import { resolveMonthlyExpenses } from "@/lib/affordability/budget";
import { safeNumber } from "@/lib/formatters/number";
import type { AffordabilityResult, FinancialProfile } from "@/types/finance";

export function IncomeAllocation({
  profile,
  analysis,
}: {
  profile: FinancialProfile;
  analysis: AffordabilityResult;
}) {
  const income =
    safeNumber(profile.monthlyIncome, 0) +
    safeNumber(profile.otherMonthlyIncome, 0);
  const living = resolveMonthlyExpenses(profile);
  const existingEmis =
    safeNumber(profile.existingEMIs, 0) +
    safeNumber(profile.creditCardCommitments, 0) +
    safeNumber(profile.otherCommitments, 0);
  const car = analysis.safeMonthlyBudget;
  const remaining = Math.max(0, income - living - existingEmis - car);
  const total = Math.max(income, 1);

  const rows = [
    { label: "Income", value: income, tone: "bg-zinc-800" },
    { label: "Living expenses", value: living, tone: "bg-zinc-400" },
    { label: "Existing EMIs", value: existingEmis, tone: "bg-zinc-500" },
    { label: "Car ownership", value: car, tone: "bg-teal-600" },
    { label: "Remaining", value: remaining, tone: "bg-emerald-600" },
  ];

  return (
    <Card className="border-border shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Monthly income allocation
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Planning view using your comfortable car ownership budget.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium tabular-nums">
                {formatINR(row.value)}
              </span>
            </div>
            {row.label !== "Income" ? (
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${row.tone}`}
                  style={{
                    width: `${Math.min(100, (row.value / total) * 100)}%`,
                  }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
