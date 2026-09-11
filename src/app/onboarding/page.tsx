"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CurrencyInput } from "@/components/finance/CurrencyInput";
import { EmergencyFundWarning } from "@/components/finance/EmergencyFundWarning";
import { Disclaimer } from "@/components/finance/Disclaimer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppProvider";
import { LOAN_TENURE_OPTIONS } from "@/lib/affordability";
import { resolveEmergencyFundTarget } from "@/lib/affordability";
import { cities } from "@/data/cities";
import {
  commitmentsStepSchema,
  drivingStepSchema,
  expensesStepSchema,
  incomeStepSchema,
  loanStepSchema,
  savingsStepSchema,
  type CommitmentsStepInput,
  type DrivingStepInput,
  type ExpensesStepInput,
  type IncomeStepInput,
  type LoanStepInput,
  type SavingsStepInput,
} from "@/lib/validation/schemas";
import type { FinancialProfile } from "@/types/finance";

const STEPS = [
  "Income",
  "Expenses",
  "Commitments",
  "Savings",
  "Driving",
  "Loan",
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile, markOnboardingComplete } = useApp();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<FinancialProfile>(profile);

  const progress = ((step + 1) / STEPS.length) * 100;

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const finish = (loan: LoanStepInput) => {
    const next: FinancialProfile = {
      ...draft,
      downPayment: loan.downPayment,
      savings: loan.savings,
      loanTenureYears: loan.loanTenureYears,
      interestRate: loan.interestRate,
      preferredCityId: loan.preferredCityId,
    };
    setProfile(next);
    markOnboardingComplete(true);
    router.push("/preferences");
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-8">
      <div className="space-y-3">
        <p className="text-sm font-medium text-accent">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="font-display text-3xl font-semibold">{STEPS[step]}</h1>
        <Progress value={progress} />
      </div>

      {step === 0 ? (
        <IncomeStep
          defaults={draft}
          onBack={undefined}
          onNext={(data) => {
            setDraft((d) => ({ ...d, ...data }));
            goNext();
          }}
        />
      ) : null}
      {step === 1 ? (
        <ExpensesStep
          defaults={draft}
          onBack={goBack}
          onNext={(data) => {
            setDraft((d) => ({ ...d, ...data }));
            goNext();
          }}
        />
      ) : null}
      {step === 2 ? (
        <CommitmentsStep
          defaults={draft}
          onBack={goBack}
          onNext={(data) => {
            setDraft((d) => ({ ...d, ...data }));
            goNext();
          }}
        />
      ) : null}
      {step === 3 ? (
        <SavingsStep
          defaults={draft}
          onBack={goBack}
          onNext={(data) => {
            setDraft((d) => ({ ...d, ...data }));
            goNext();
          }}
        />
      ) : null}
      {step === 4 ? (
        <DrivingStep
          defaults={draft}
          onBack={goBack}
          onNext={(data) => {
            setDraft((d) => ({ ...d, ...data }));
            goNext();
          }}
        />
      ) : null}
      {step === 5 ? (
        <LoanStep
          defaults={draft}
          onBack={goBack}
          onNext={finish}
        />
      ) : null}

      <Disclaimer />
    </div>
  );
}

function StepNav({
  onBack,
  nextLabel = "Continue",
  disabled,
}: {
  onBack?: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack ? (
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
      ) : null}
      <Button type="submit" className="flex-1" disabled={disabled}>
        {nextLabel}
      </Button>
    </div>
  );
}

function IncomeStep({
  defaults,
  onNext,
  onBack,
}: {
  defaults: FinancialProfile;
  onNext: (data: IncomeStepInput) => void;
  onBack?: () => void;
}) {
  const form = useForm<IncomeStepInput>({
    resolver: zodResolver(incomeStepSchema),
    defaultValues: {
      monthlyIncome: defaults.monthlyIncome,
      otherMonthlyIncome: defaults.otherMonthlyIncome,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <CurrencyInput
        label="Monthly take-home income"
        value={form.watch("monthlyIncome")}
        onChange={(v) => form.setValue("monthlyIncome", v, { shouldValidate: true })}
        error={form.formState.errors.monthlyIncome?.message}
      />
      <CurrencyInput
        label="Other monthly income"
        value={form.watch("otherMonthlyIncome")}
        onChange={(v) =>
          form.setValue("otherMonthlyIncome", v, { shouldValidate: true })
        }
        error={form.formState.errors.otherMonthlyIncome?.message}
        hint="Side income, rentals, etc."
      />
      <StepNav onBack={onBack} />
    </form>
  );
}

function ExpensesStep({
  defaults,
  onNext,
  onBack,
}: {
  defaults: FinancialProfile;
  onNext: (data: ExpensesStepInput) => void;
  onBack: () => void;
}) {
  const form = useForm<ExpensesStepInput>({
    resolver: zodResolver(expensesStepSchema),
    defaultValues: {
      expenseMode: defaults.expenseMode,
      monthlyExpenses: defaults.monthlyExpenses,
      expenseBreakdown: defaults.expenseBreakdown ?? {
        rent: 0,
        food: 0,
        utilities: 0,
        insurance: 0,
        education: 0,
        entertainment: 0,
        other: 0,
      },
    },
  });

  const mode = form.watch("expenseMode");
  const breakdown = form.watch("expenseBreakdown");

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <Tabs
        value={mode}
        onValueChange={(v) =>
          form.setValue("expenseMode", v as "total" | "breakdown", {
            shouldValidate: true,
          })
        }
        defaultValue={mode}
      >
        <TabsList>
          <TabsTrigger value="total">Total expenses</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>
        <TabsContent value="total">
          <CurrencyInput
            label="Total monthly expenses"
            value={form.watch("monthlyExpenses")}
            onChange={(v) =>
              form.setValue("monthlyExpenses", v, { shouldValidate: true })
            }
            error={form.formState.errors.monthlyExpenses?.message}
          />
        </TabsContent>
        <TabsContent value="breakdown" className="space-y-3">
          {(
            [
              ["rent", "Rent / EMI housing"],
              ["food", "Food & groceries"],
              ["utilities", "Utilities"],
              ["insurance", "Insurance"],
              ["education", "Education"],
              ["entertainment", "Entertainment"],
              ["other", "Other"],
            ] as const
          ).map(([key, label]) => (
            <CurrencyInput
              key={key}
              label={label}
              value={breakdown?.[key] ?? 0}
              onChange={(v) =>
                form.setValue(
                  "expenseBreakdown",
                  { ...(breakdown ?? {}), [key]: v } as NonNullable<
                    ExpensesStepInput["expenseBreakdown"]
                  >,
                  { shouldValidate: true },
                )
              }
            />
          ))}
        </TabsContent>
      </Tabs>
      <StepNav onBack={onBack} />
    </form>
  );
}

function CommitmentsStep({
  defaults,
  onNext,
  onBack,
}: {
  defaults: FinancialProfile;
  onNext: (data: CommitmentsStepInput) => void;
  onBack: () => void;
}) {
  const form = useForm<CommitmentsStepInput>({
    resolver: zodResolver(commitmentsStepSchema),
    defaultValues: {
      existingEMIs: defaults.existingEMIs,
      creditCardCommitments: defaults.creditCardCommitments,
      otherCommitments: defaults.otherCommitments,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <CurrencyInput
        label="Existing EMIs"
        value={form.watch("existingEMIs")}
        onChange={(v) => form.setValue("existingEMIs", v, { shouldValidate: true })}
        error={form.formState.errors.existingEMIs?.message}
      />
      <CurrencyInput
        label="Credit card minimums"
        value={form.watch("creditCardCommitments")}
        onChange={(v) =>
          form.setValue("creditCardCommitments", v, { shouldValidate: true })
        }
        error={form.formState.errors.creditCardCommitments?.message}
      />
      <CurrencyInput
        label="Other monthly commitments"
        value={form.watch("otherCommitments")}
        onChange={(v) =>
          form.setValue("otherCommitments", v, { shouldValidate: true })
        }
        error={form.formState.errors.otherCommitments?.message}
      />
      <StepNav onBack={onBack} />
    </form>
  );
}

function SavingsStep({
  defaults,
  onNext,
  onBack,
}: {
  defaults: FinancialProfile;
  onNext: (data: SavingsStepInput) => void;
  onBack: () => void;
}) {
  const form = useForm<SavingsStepInput>({
    resolver: zodResolver(savingsStepSchema),
    defaultValues: {
      savings: defaults.savings,
      emergencyFundTarget: defaults.emergencyFundTarget,
      downPayment: defaults.downPayment,
    },
  });

  const savings = form.watch("savings");
  const downPayment = form.watch("downPayment");
  const emergencyFundTarget = form.watch("emergencyFundTarget");
  const remaining = savings - downPayment;
  const previewProfile = useMemo(
    () => ({
      ...defaults,
      savings,
      downPayment,
      emergencyFundTarget,
    }),
    [defaults, savings, downPayment, emergencyFundTarget],
  );
  const target = resolveEmergencyFundTarget(previewProfile);

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <CurrencyInput
        label="Liquid savings"
        value={savings}
        onChange={(v) => form.setValue("savings", v, { shouldValidate: true })}
        error={form.formState.errors.savings?.message}
      />
      <CurrencyInput
        label="Emergency fund target"
        value={emergencyFundTarget}
        onChange={(v) =>
          form.setValue("emergencyFundTarget", v, { shouldValidate: true })
        }
        error={form.formState.errors.emergencyFundTarget?.message}
        hint="Aim for 3+ months of expenses"
      />
      <CurrencyInput
        label="Planned down payment"
        value={downPayment}
        onChange={(v) => form.setValue("downPayment", v, { shouldValidate: true })}
        error={form.formState.errors.downPayment?.message}
        max={savings}
      />
      <EmergencyFundWarning remaining={remaining} target={target} />
      <StepNav onBack={onBack} />
    </form>
  );
}

function DrivingStep({
  defaults,
  onNext,
  onBack,
}: {
  defaults: FinancialProfile;
  onNext: (data: DrivingStepInput) => void;
  onBack: () => void;
}) {
  const form = useForm<DrivingStepInput>({
    resolver: zodResolver(drivingStepSchema),
    defaultValues: {
      monthlyKm: defaults.monthlyKm,
      cityHighwaySplit: defaults.cityHighwaySplit,
    },
  });

  const km = form.watch("monthlyKm");
  const split = form.watch("cityHighwaySplit");

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="monthlyKm">Monthly kilometres</Label>
        <Slider
          id="monthlyKm"
          min={0}
          max={5000}
          step={50}
          value={km}
          valueLabel={`${km} km`}
          onChange={(e) =>
            form.setValue("monthlyKm", Number(e.target.value), {
              shouldValidate: true,
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="citySplit">City vs highway split</Label>
        <Slider
          id="citySplit"
          min={0}
          max={100}
          step={5}
          value={split}
          valueLabel={`${split}% city · ${100 - split}% highway`}
          onChange={(e) =>
            form.setValue("cityHighwaySplit", Number(e.target.value), {
              shouldValidate: true,
            })
          }
        />
      </div>
      <StepNav onBack={onBack} />
    </form>
  );
}

function LoanStep({
  defaults,
  onNext,
  onBack,
}: {
  defaults: FinancialProfile;
  onNext: (data: LoanStepInput) => void;
  onBack: () => void;
}) {
  const form = useForm<LoanStepInput>({
    resolver: zodResolver(loanStepSchema),
    defaultValues: {
      downPayment: defaults.downPayment,
      savings: defaults.savings,
      loanTenureYears: defaults.loanTenureYears,
      interestRate: defaults.interestRate,
      preferredCityId: defaults.preferredCityId,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <CurrencyInput
        label="Down payment"
        value={form.watch("downPayment")}
        onChange={(v) => form.setValue("downPayment", v, { shouldValidate: true })}
        error={form.formState.errors.downPayment?.message}
      />
      <div className="space-y-1.5">
        <Label htmlFor="tenure">Loan tenure</Label>
        <Select
          id="tenure"
          value={String(form.watch("loanTenureYears"))}
          onChange={(e) =>
            form.setValue(
              "loanTenureYears",
              Number(e.target.value) as LoanStepInput["loanTenureYears"],
              { shouldValidate: true },
            )
          }
        >
          {LOAN_TENURE_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y} years
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rate">Car loan interest rate</Label>
        <Slider
          id="rate"
          min={0}
          max={20}
          step={0.05}
          value={form.watch("interestRate")}
          valueLabel={`${Number(form.watch("interestRate")).toFixed(2)}% p.a.`}
          onChange={(e) =>
            form.setValue("interestRate", Number(e.target.value), {
              shouldValidate: true,
            })
          }
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          7.45% is used as the default planning rate. Actual rates vary by
          lender, credit profile, loan amount, tenure and offers.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="city">Preferred city</Label>
        <Select
          id="city"
          value={form.watch("preferredCityId")}
          onChange={(e) =>
            form.setValue("preferredCityId", e.target.value, {
              shouldValidate: true,
            })
          }
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}, {city.state}
            </option>
          ))}
        </Select>
      </div>
      <StepNav onBack={onBack} nextLabel="Save & continue" />
    </form>
  );
}
