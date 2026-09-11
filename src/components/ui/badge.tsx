import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-accent/15 text-accent",
        secondary: "border-transparent bg-muted text-muted-foreground",
        outline: "border-border text-foreground",
        success: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        warning: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
        danger: "border-transparent bg-rose-500/15 text-rose-700 dark:text-rose-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
