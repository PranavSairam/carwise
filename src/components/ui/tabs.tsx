"use client";

import {
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  className,
  children,
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled ?? uncontrolled;
  const setValue = (next: string) => {
    if (controlled === undefined) {
      setUncontrolled(next);
    }
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-muted p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsTrigger must be used within Tabs");
  }
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
      onClick={() => ctx.setValue(value)}
      {...props}
    />
  );
}

export function TabsContent({
  value,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsContent must be used within Tabs");
  }
  if (ctx.value !== value) {
    return null;
  }
  return (
    <div
      role="tabpanel"
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    />
  );
}
