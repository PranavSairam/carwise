"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          Car<span className="text-accent">Wise</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/cars" className="text-muted-foreground hover:text-foreground">
            Cars
          </Link>
          <Link
            href="/compare"
            className="text-muted-foreground hover:text-foreground"
          >
            Compare
          </Link>
          <Link
            href="/results"
            className="text-muted-foreground hover:text-foreground"
          >
            Results
          </Link>
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-foreground"
          >
            Profile
          </Link>
        </nav>
        <div className="hidden w-10 md:block" aria-hidden />
      </div>
    </header>
  );
}
