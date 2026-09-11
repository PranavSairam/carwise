import { Badge } from "@/components/ui/badge";
import type { AffordabilityStatus } from "@/types/finance";
import { cn } from "@/lib/utils";

const STATUS_COPY: Record<
  AffordabilityStatus,
  { label: string; variant: "success" | "warning" | "danger"; hint: string }
> = {
  comfortable: {
    label: "🟢 Comfortable",
    variant: "success",
    hint: "Ownership leaves healthy monthly disposable income",
  },
  stretch: {
    label: "🟡 Stretch",
    variant: "warning",
    hint: "Possible, but significantly reduces financial flexibility",
  },
  not_recommended: {
    label: "🔴 Not recommended",
    variant: "danger",
    hint: "Ownership would put excessive pressure on your finances",
  },
};

export function AffordabilityBadge({
  status,
  className,
  showHint = false,
}: {
  status: AffordabilityStatus;
  className?: string;
  showHint?: boolean;
}) {
  const copy = STATUS_COPY[status];
  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <Badge variant={copy.variant}>{copy.label}</Badge>
      {showHint ? (
        <span className="text-xs text-muted-foreground">{copy.hint}</span>
      ) : null}
    </div>
  );
}
