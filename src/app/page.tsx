"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { BudgetFlowVisual } from "@/components/charts/BudgetFlowVisual";
import { Disclaimer } from "@/components/finance/Disclaimer";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppProvider";
import { formatINR } from "@/lib/formatters/currency";

export default function HomePage() {
  const { showWelcomeBack, profile, hydrated } = useApp();

  return (
    <div className="space-y-16 pb-8">
      <section className="relative overflow-hidden rounded-xl border border-border bg-white px-6 py-12 sm:px-10 sm:py-16">
        <div className="relative max-w-2xl space-y-6">
          <p className="text-4xl font-semibold tracking-tight text-accent sm:text-5xl">
            CarWise
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            Find the car you can actually afford.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Built for the Indian car-buying market — ex-showroom vs estimated
            on-road, EMI, RTO, insurance and fuel costs by city. Find what you
            can comfortably own, not just what a loan approves.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Find My Cars
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cars"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-white px-6 text-base font-medium transition-colors hover:bg-muted"
            >
              Explore Cars
            </Link>
          </div>
        </div>
      </section>

      {hydrated && showWelcomeBack ? (
        <section className="rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold">Welcome back</p>
              <p className="text-sm text-muted-foreground">
                Your profile is saved
                {profile.monthlyIncome > 0
                  ? ` · income ${formatINR(profile.monthlyIncome)}/mo`
                  : ""}
                . Jump back to matches.
              </p>
            </div>
            <Link
              href="/results"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-accent-foreground"
            >
              View results
            </Link>
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <div className="max-w-xl space-y-2">
          <h2 className="font-display text-2xl font-semibold">How it works</h2>
          <p className="text-muted-foreground">
            A simple path from cash flow to cars you can responsibly own.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Tell us about your finances",
            "Set your preferences",
            "Get your safe car budget",
            "Explore cars that fit",
          ].map((step, i) => (
            <li
              key={step}
              className="rounded-2xl border border-border bg-card px-5 py-5"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Step {i + 1}
              </span>
              <p className="mt-2 font-display text-lg font-semibold leading-snug">
                {step}
              </p>
            </li>
          ))}
        </ol>
        <BudgetFlowVisual />
      </section>

      <section className="space-y-6">
        <div className="max-w-xl space-y-2">
          <h2 className="font-display text-2xl font-semibold">Why CarWise</h2>
          <p className="text-muted-foreground">
            Built around total ownership cost — not sticker price alone.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Wallet,
              title: "True monthly cost",
              body: "EMI, fuel, insurance, maintenance and consumables in one picture.",
            },
            {
              icon: ShieldCheck,
              title: "Emergency-aware",
              body: "We flag when a down payment risks dipping into your safety net.",
            },
            {
              icon: Sparkles,
              title: "Matched to you",
              body: "Preferences and budget rank cars that fit — including Volkswagen picks.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-muted/40 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Ready to find your budget?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Takes a few minutes. Data stays on your device.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm font-medium text-accent-foreground"
        >
          Start onboarding
        </Link>
      </section>

      <Disclaimer />
    </div>
  );
}
