import { AlertTriangle } from "lucide-react";
import { formatINR } from "@/lib/formatters/currency";
import { cn } from "@/lib/utils";

export function EmergencyFundWarning({
  remaining,
  target,
  className,
}: {
  remaining: number;
  target: number;
  className?: string;
}) {
  if (remaining >= target) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">Emergency fund may be at risk</p>
        <p className="mt-1 text-xs opacity-90">
          After your down payment you&apos;d have {formatINR(remaining)} left,
          below your {formatINR(target)} emergency target. Consider a smaller
          down payment or building savings first.
        </p>
      </div>
    </div>
  );
}
