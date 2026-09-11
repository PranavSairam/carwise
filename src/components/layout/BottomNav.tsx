"use client";

import { Car, GitCompareArrows, Home, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppProvider";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/cars", label: "Cars", icon: Car },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { compareIds } = useApp();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{label}</span>
                {href === "/compare" && compareIds.length > 0 ? (
                  <span className="absolute right-[calc(50%-18px)] top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
                    {compareIds.length}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
