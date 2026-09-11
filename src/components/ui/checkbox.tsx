"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => (
    <label
      htmlFor={id}
      className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-border text-accent focus-visible:ring-2 focus-visible:ring-accent",
          className,
        )}
        {...props}
      />
      {label ? <span>{label}</span> : null}
    </label>
  ),
);
Checkbox.displayName = "Checkbox";
