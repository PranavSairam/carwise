import { DISCLAIMER_TEXT } from "@/lib/defaults";
import { cn } from "@/lib/utils";

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {DISCLAIMER_TEXT}
    </p>
  );
}
