"use client";

import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CompareBar } from "@/components/cars/CompareBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10">
        {children}
      </main>
      <Footer />
      <CompareBar />
      <BottomNav />
    </div>
  );
}
