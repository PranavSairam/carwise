import { DATA_ASSUMPTIONS_TEXT } from "@/lib/affordability/constants";
import { cn } from "@/lib/utils";

export function DataAssumptions({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-white px-4 py-3",
        className,
      )}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Data & assumptions
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {DATA_ASSUMPTIONS_TEXT}
      </p>
    </section>
  );
}
