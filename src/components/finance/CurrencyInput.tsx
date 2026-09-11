"use client";

import { useId, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps {
  id?: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  error?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  hint?: string;
}

function parseINRInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) {
    return 0;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function displayValue(n: number, focused: boolean, draft: string): string {
  if (focused) {
    return draft;
  }
  if (!n) {
    return "";
  }
  return Math.round(n).toLocaleString("en-IN");
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  className,
  error,
  min = 0,
  max,
  disabled,
  hint,
}: CurrencyInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDraft(raw);
    let next = parseINRInput(raw);
    if (min !== undefined) {
      next = Math.max(min, next);
    }
    if (max !== undefined) {
      next = Math.min(max, next);
    }
    onChange(next);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₹
        </span>
        <Input
          id={inputId}
          inputMode="numeric"
          disabled={disabled}
          className={cn("pl-7 tabular-nums", error && "border-destructive")}
          value={displayValue(value, focused, draft)}
          onFocus={() => {
            setFocused(true);
            setDraft(value ? String(Math.round(value)) : "");
          }}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
        />
      </div>
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
