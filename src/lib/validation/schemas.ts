import { z } from "zod";
import { LOAN_TENURE_OPTIONS } from "@/lib/affordability/constants";

const nonNegative = z.number().finite().min(0, "Cannot be negative");

export const expenseBreakdownSchema = z.object({
  rent: nonNegative,
  food: nonNegative,
  utilities: nonNegative,
  insurance: nonNegative,
  education: nonNegative,
  entertainment: nonNegative,
  other: nonNegative,
});

export const incomeStepSchema = z.object({
  monthlyIncome: nonNegative,
  otherMonthlyIncome: nonNegative,
});

export const expensesStepSchema = z
  .object({
    expenseMode: z.enum(["total", "breakdown"]),
    monthlyExpenses: nonNegative,
    expenseBreakdown: expenseBreakdownSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.expenseMode === "breakdown" && !data.expenseBreakdown) {
      ctx.addIssue({
        code: "custom",
        message: "Expense breakdown is required",
        path: ["expenseBreakdown"],
      });
    }
  });

export const commitmentsStepSchema = z.object({
  existingEMIs: nonNegative,
  creditCardCommitments: nonNegative,
  otherCommitments: nonNegative,
});

export const savingsStepSchema = z
  .object({
    savings: nonNegative,
    emergencyFundTarget: nonNegative,
    downPayment: nonNegative,
  })
  .superRefine((data, ctx) => {
    if (data.downPayment > data.savings) {
      ctx.addIssue({
        code: "custom",
        message: "Down payment cannot exceed savings",
        path: ["downPayment"],
      });
    }
  });

export const drivingStepSchema = z.object({
  monthlyKm: nonNegative,
  cityHighwaySplit: z
    .number()
    .finite()
    .min(0, "Must be between 0 and 100")
    .max(100, "Must be between 0 and 100"),
});

export const loanTenureSchema = z.union([
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

export const loanStepSchema = z
  .object({
    downPayment: nonNegative,
    savings: nonNegative,
    loanTenureYears: loanTenureSchema,
    interestRate: z
      .number()
      .finite()
      .min(0, "Interest rate cannot be negative")
      .max(20, "Interest rate should be between 0% and 20%"),
    preferredCityId: z.string().min(1, "Select a city"),
  })
  .superRefine((data, ctx) => {
    if (data.downPayment > data.savings) {
      ctx.addIssue({
        code: "custom",
        message: "Down payment cannot exceed savings",
        path: ["downPayment"],
      });
    }
    if (
      !(LOAN_TENURE_OPTIONS as readonly number[]).includes(data.loanTenureYears)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select a valid loan tenure",
        path: ["loanTenureYears"],
      });
    }
  });

export const financialProfileSchema = z
  .object({
    monthlyIncome: nonNegative,
    otherMonthlyIncome: nonNegative,
    monthlyExpenses: nonNegative,
    expenseMode: z.enum(["total", "breakdown"]),
    expenseBreakdown: expenseBreakdownSchema.optional(),
    existingEMIs: nonNegative,
    creditCardCommitments: nonNegative,
    otherCommitments: nonNegative,
    savings: nonNegative,
    emergencyFundTarget: nonNegative,
    downPayment: nonNegative,
    monthlyKm: nonNegative,
    cityHighwaySplit: z.number().finite().min(0).max(100),
    loanTenureYears: loanTenureSchema,
    interestRate: z.number().finite().min(0).max(20),
    preferredCityId: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.downPayment > data.savings) {
      ctx.addIssue({
        code: "custom",
        message: "Down payment cannot exceed savings",
        path: ["downPayment"],
      });
    }
    if (data.expenseMode === "breakdown" && !data.expenseBreakdown) {
      ctx.addIssue({
        code: "custom",
        message: "Expense breakdown is required when using breakdown mode",
        path: ["expenseBreakdown"],
      });
    }
  });

export const seatingPreferenceSchema = z.enum(["4/5", "6/7", "8+"]);

export const carPreferencesSchema = z.object({
  bodyTypes: z.array(
    z.enum(["Hatchback", "Sedan", "SUV", "MUV", "MPV", "Luxury"]),
  ),
  fuels: z.array(z.enum(["Petrol", "Diesel", "CNG", "Hybrid", "EV"])),
  transmissions: z.array(
    z.enum(["Manual", "Automatic", "AMT", "DCT", "CVT"]),
  ),
  seating: z.array(seatingPreferenceSchema),
  purchaseTypes: z.array(z.enum(["New", "Used"])),
  brandIds: z.array(z.string().min(1)),
  maxPrice: nonNegative.optional(),
  query: z.string().optional(),
});

export type IncomeStepInput = z.infer<typeof incomeStepSchema>;
export type ExpensesStepInput = z.infer<typeof expensesStepSchema>;
export type CommitmentsStepInput = z.infer<typeof commitmentsStepSchema>;
export type SavingsStepInput = z.infer<typeof savingsStepSchema>;
export type DrivingStepInput = z.infer<typeof drivingStepSchema>;
export type LoanStepInput = z.infer<typeof loanStepSchema>;
export type FinancialProfileInput = z.infer<typeof financialProfileSchema>;
export type CarPreferencesInput = z.infer<typeof carPreferencesSchema>;
