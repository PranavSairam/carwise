import {
  calculateAffordabilityScore,
  getAffordabilityStatus,
  getSafeDownPayment,
  resolveEmergencyFundTarget,
} from "@/lib/affordability/budget";
import {
  calculateFuelCost,
  calculateTotalMonthlyCarCost,
} from "@/lib/affordability/costs";
import { clamp, safeNumber } from "@/lib/formatters/number";
import type { Car } from "@/types/car";
import type {
  AffordabilityStatus,
  FinancialProfile,
  OwnershipCostBreakdown,
} from "@/types/finance";
import type { CarPreferences, SeatingPreference } from "@/types/preferences";

export interface RankMatchDetails {
  bodyTypeMatch: boolean;
  fuelMatch: boolean;
  transmissionMatch: boolean;
  seatingMatch: boolean;
  brandMatch: boolean;
  purchaseTypeMatch: boolean;
  withinMaxPrice: boolean;
  emergencyFundIntact: boolean;
}

export interface RankedCar {
  carId: string;
  score: number;
  status: AffordabilityStatus;
  reasons: string[];
  consider: string[];
  ownership: OwnershipCostBreakdown;
  matchDetails: RankMatchDetails;
  moneyLeftAfterCar: number;
}

export interface RankCarsOptions {
  onRoadPrice: (car: Car) => number;
}

const WEIGHTS = {
  affordability: 35,
  monthlyCost: 18,
  bodyType: 10,
  fuel: 10,
  transmission: 8,
  seating: 7,
  brand: 7,
  emergencyFund: 5,
} as const;

export function rankCars(
  cars: readonly Car[],
  profile: FinancialProfile,
  preferences: CarPreferences,
  analysis: {
    safeMonthlyBudget: number;
    stretchMonthlyBudget: number;
    disposableIncome: number;
  },
  options: RankCarsOptions,
): RankedCar[] {
  const downPayment = getSafeDownPayment(profile);
  const emergencyIntact =
    safeNumber(profile.savings, 0) - safeNumber(profile.downPayment, 0) >=
    resolveEmergencyFundTarget(profile);

  const ranked = cars.map((car) =>
    scoreCar(
      car,
      profile,
      preferences,
      analysis,
      options,
      downPayment,
      emergencyIntact,
    ),
  );

  return ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.ownership.totalMonthly - b.ownership.totalMonthly;
  });
}

function scoreCar(
  car: Car,
  profile: FinancialProfile,
  preferences: CarPreferences,
  analysis: {
    safeMonthlyBudget: number;
    stretchMonthlyBudget: number;
    disposableIncome: number;
  },
  options: RankCarsOptions,
  downPayment: number,
  emergencyFundIntact: boolean,
): RankedCar {
  const onRoadPrice = options.onRoadPrice(car);
  const fuel = calculateFuelCost(
    {
      fuel: car.fuel,
      mileage: car.mileage,
      fuelEfficiencyUnit: car.fuelEfficiencyUnit,
      electricityRatePerKwh: car.electricityRatePerKwh,
    },
    profile.monthlyKm,
    profile.cityHighwaySplit,
  );

  const ownership = calculateTotalMonthlyCarCost({
    onRoadPrice,
    downPayment,
    annualInterestRate: profile.interestRate,
    loanTenureYears: profile.loanTenureYears,
    fuel,
    insuranceAnnual: car.insuranceAnnualEstimate,
    maintenanceMonthly: car.maintenanceMonthlyEstimate,
    tyresConsumablesMonthly: car.tyreConsumablesMonthlyEstimate,
  });

  const status = getAffordabilityStatus(
    ownership.totalMonthly,
    analysis.safeMonthlyBudget,
    analysis.stretchMonthlyBudget,
  );

  const moneyLeftAfterCar = Math.max(
    0,
    analysis.disposableIncome - ownership.totalMonthly,
  );

  const affordabilityScore = calculateAffordabilityScore(
    ownership.totalMonthly,
    analysis.safeMonthlyBudget,
    analysis.stretchMonthlyBudget,
  );

  const matchDetails: RankMatchDetails = {
    bodyTypeMatch: matchesOrOpen(preferences.bodyTypes, car.bodyType),
    fuelMatch: matchesOrOpen(preferences.fuels, car.fuel),
    transmissionMatch: matchesOrOpen(
      preferences.transmissions,
      car.transmission,
    ),
    seatingMatch: matchesSeating(preferences.seating, car.seats),
    brandMatch: matchesOrOpen(preferences.brandIds, car.brandId),
    purchaseTypeMatch: matchesOrOpen(
      preferences.purchaseTypes,
      car.purchaseType,
    ),
    withinMaxPrice:
      preferences.maxPrice === undefined ||
      onRoadPrice <= safeNumber(preferences.maxPrice, Infinity),
    emergencyFundIntact,
  };

  let score = 0;
  score += (affordabilityScore / 100) * WEIGHTS.affordability;
  score +=
    monthlyCostFactor(ownership.totalMonthly, analysis) * WEIGHTS.monthlyCost;
  score += matchDetails.bodyTypeMatch ? WEIGHTS.bodyType : 0;
  score += matchDetails.fuelMatch ? WEIGHTS.fuel : 0;
  score += matchDetails.transmissionMatch ? WEIGHTS.transmission : 0;
  score += matchDetails.seatingMatch ? WEIGHTS.seating : 0;
  score += matchDetails.brandMatch ? WEIGHTS.brand : 0;
  score += matchDetails.emergencyFundIntact ? WEIGHTS.emergencyFund : 0;

  // Prefer lower total ownership when otherwise similar.
  if (ownership.totalMonthly <= analysis.safeMonthlyBudget) {
    score += 3;
  }

  if (!matchDetails.withinMaxPrice) {
    score *= 0.5;
  }
  if (!matchDetails.purchaseTypeMatch) {
    score *= 0.85;
  }

  const { reasons, consider } = buildRecommendationCopy(
    car,
    status,
    matchDetails,
    ownership,
    moneyLeftAfterCar,
  );

  return {
    carId: car.id,
    score: Math.round(clamp(score, 0, 100) * 10) / 10,
    status,
    reasons,
    consider,
    ownership,
    matchDetails,
    moneyLeftAfterCar,
  };
}

function monthlyCostFactor(
  monthlyCost: number,
  analysis: { safeMonthlyBudget: number; stretchMonthlyBudget: number },
): number {
  const safe = Math.max(1, analysis.safeMonthlyBudget);
  if (monthlyCost <= analysis.safeMonthlyBudget) {
    return clamp(1 - monthlyCost / (safe * 1.5), 0.4, 1);
  }
  if (monthlyCost <= analysis.stretchMonthlyBudget) {
    return 0.35;
  }
  return 0.1;
}

function matchesOrOpen<T>(selected: readonly T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

function matchesSeating(
  preferences: readonly SeatingPreference[],
  seats: number,
): boolean {
  if (preferences.length === 0) {
    return true;
  }
  return preferences.some((pref) => seatingMatches(pref, seats));
}

export function seatingMatches(
  pref: SeatingPreference,
  seats: number,
): boolean {
  switch (pref) {
    case "4/5":
      return seats === 4 || seats === 5;
    case "6/7":
      return seats === 6 || seats === 7;
    case "8+":
      return seats >= 8;
    default: {
      const _exhaustive: never = pref;
      return _exhaustive;
    }
  }
}

function buildRecommendationCopy(
  car: Car,
  status: AffordabilityStatus,
  details: RankMatchDetails,
  ownership: OwnershipCostBreakdown,
  moneyLeft: number,
): { reasons: string[]; consider: string[] } {
  const reasons: string[] = [];
  const consider: string[] = [];

  if (status === "comfortable") {
    reasons.push("Monthly ownership is within your comfortable range");
  } else if (status === "stretch") {
    reasons.push("Possible, but significantly reduces financial flexibility");
    consider.push("Leaves less room for unexpected expenses");
  } else {
    consider.push("Estimated ownership would put pressure on your finances");
  }

  if (details.bodyTypeMatch) {
    reasons.push(`Matches your ${car.bodyType} preference`);
  }
  if (details.fuelMatch) {
    reasons.push(`${car.fuel} matches your fuel preference`);
  }
  if (details.transmissionMatch) {
    reasons.push(`${car.transmission} transmission`);
  }
  if (details.seatingMatch) {
    reasons.push(`${car.seats}-seater layout`);
  }
  if (details.brandMatch) {
    reasons.push(`${car.brand} is among your preferred brands`);
  }
  if (details.emergencyFundIntact) {
    reasons.push("Down payment preserves emergency savings");
  } else {
    consider.push("Down payment may dip into emergency savings");
  }

  if (moneyLeft > 0) {
    reasons.push(
      `Est. money left after car ≈ ₹${Math.round(moneyLeft).toLocaleString("en-IN")}/mo`,
    );
  }

  if (ownership.insurance > 3_500) {
    consider.push("Insurance estimate is higher than smaller alternatives");
  }
  if (ownership.maintenance > 2_500) {
    consider.push("Maintenance may be higher than a hatchback");
  }
  if (car.fuel === "Diesel" && ownership.fuel > 6_000) {
    consider.push("Diesel running cost depends heavily on monthly kilometres");
  }
  if (car.fuel === "EV") {
    reasons.push("Electricity cost estimate used instead of petrol");
    consider.push("Charging access and electricity tariff affect real cost");
  }
  if (!details.withinMaxPrice) {
    consider.push("Estimated on-road exceeds your max price filter");
  }

  if (consider.length === 0) {
    consider.push("Verify ex-showroom and estimated on-road with a local dealer");
  }

  return { reasons, consider };
}
