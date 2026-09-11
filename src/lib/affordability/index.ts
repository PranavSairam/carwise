export {
  SAFE_OWNERSHIP_RATIO,
  STRETCH_OWNERSHIP_RATIO,
  DEFAULT_CAR_LOAN_RATE,
  DEFAULT_INTEREST_RATE,
  DEFAULT_CITY_ID,
  LOAN_TENURE_OPTIONS,
  fuelPrices,
  PETROL_PRICE_PER_LITRE,
  DIESEL_PRICE_PER_LITRE,
  CNG_PRICE_PER_KG,
  EV_ELECTRICITY_PER_KWH,
  MIN_EMERGENCY_MONTHS,
  INTEREST_RATE_HELP,
  DATA_ASSUMPTIONS_TEXT,
} from "@/lib/affordability/constants";

export { calculateEMI, calculatePrincipalFromEMI } from "@/lib/affordability/emi";

export {
  calculateFuelCost,
  calculateInsuranceCost,
  calculateMaintenanceCost,
  calculateTotalMonthlyCarCost,
} from "@/lib/affordability/costs";
export type {
  FuelCostCarInput,
  FuelEfficiencyUnit,
  FuelKind,
  TotalMonthlyCarCostInput,
} from "@/lib/affordability/costs";

export {
  analyzeAffordability,
  calculateAffordabilityScore,
  calculateDisposableIncome,
  calculateLoanAmount,
  calculateSafeCarBudget,
  calculateStretchCarBudget,
  checkEmergencyFundWarning,
  estimateBaselineNonEmiMonthly,
  estimatePriceFromMonthlyBudget,
  getAffordabilityStatus,
  getFinancialComfort,
  getSafeDownPayment,
  resolveEmergencyFundTarget,
  resolveMonthlyExpenses,
} from "@/lib/affordability/budget";

export { rankCars, seatingMatches } from "@/lib/affordability/ranking";
export type {
  RankCarsOptions,
  RankMatchDetails,
  RankedCar,
} from "@/lib/affordability/ranking";
