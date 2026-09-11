import { formatINRCompact } from "@/lib/formatters/currency";
import type { AffordabilityResult } from "@/types/finance";
import { cn } from "@/lib/utils";

export function AffordabilityRange({
  analysis,
  className,
}: {
  analysis: AffordabilityResult;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium">Affordability categories</p>
      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border text-sm sm:grid-cols-3">
        <div className="border-b border-border bg-emerald-50 px-3 py-4 sm:border-b-0 sm:border-r">
          <p className="font-semibold text-emerald-800">🟢 Comfortable</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Healthy disposable income remains
          </p>
          <p className="mt-2 tabular-nums font-medium">
            up to {formatINRCompact(analysis.comfortablePriceRange.max)}
          </p>
        </div>
        <div className="border-b border-border bg-amber-50 px-3 py-4 sm:border-b-0 sm:border-r">
          <p className="font-semibold text-amber-800">🟡 Stretch</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Possible, less financial flexibility
          </p>
          <p className="mt-2 tabular-nums font-medium">
            to {formatINRCompact(analysis.stretchPriceRange.max)}
          </p>
        </div>
        <div className="bg-rose-50 px-3 py-4">
          <p className="font-semibold text-rose-800">🔴 Not recommended</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Excessive pressure on finances
          </p>
          <p className="mt-2 tabular-nums font-medium">
            above {formatINRCompact(analysis.stretchPriceRange.max)}
          </p>
        </div>
      </div>
    </div>
  );
}
