"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  valueLabel?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueLabel, id, ...props }, ref) => (
    <div className="w-full space-y-2">
      {(label || valueLabel) && (
        <div className="flex items-center justify-between gap-3 text-sm">
          {label ? (
            <label htmlFor={id} className="font-medium text-foreground">
              {label}
            </label>
          ) : (
            <span />
          )}
          {valueLabel ? (
            <span className="text-muted-foreground tabular-nums">{valueLabel}</span>
          ) : null}
        </div>
      )}
      <input
        ref={ref}
        id={id}
        type="range"
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--accent)]",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Slider.displayName = "Slider";
