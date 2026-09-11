/**
 * Central India-market financial assumptions for CarWise.
 * UI and calculators must import from here — never hard-code rates/prices in components.
 */

/** Default car-loan planning rate (% p.a.). Users can override. */
export const DEFAULT_CAR_LOAN_RATE = 7.45;

/** @deprecated Use DEFAULT_CAR_LOAN_RATE — kept as alias for existing imports. */
export const DEFAULT_INTEREST_RATE = DEFAULT_CAR_LOAN_RATE;

export const DEFAULT_CITY_ID = "chennai";

export const LOAN_TENURE_OPTIONS = [3, 4, 5, 6, 7] as const;

/** Share of disposable income recommended for total car ownership. */
export const SAFE_OWNERSHIP_RATIO = 0.2;
export const STRETCH_OWNERSHIP_RATIO = 0.3;

export const MIN_EMERGENCY_MONTHS = 3;

/**
 * Estimated retail fuel / energy prices for India (planning defaults).
 * Actual pump/tariff rates vary by city and date.
 */
export const fuelPrices = {
  petrol: 105, // ₹/litre
  diesel: 95, // ₹/litre
  cng: 80, // ₹/kg (approx.)
  electricity: 8, // ₹/kWh (home/public blended estimate)
} as const;

/** Back-compat aliases used by older cost helpers. */
export const PETROL_PRICE_PER_LITRE = fuelPrices.petrol;
export const DIESEL_PRICE_PER_LITRE = fuelPrices.diesel;
export const CNG_PRICE_PER_KG = fuelPrices.cng;
export const EV_ELECTRICITY_PER_KWH = fuelPrices.electricity;

/** Rough non-EMI ownership costs used only for price-range display estimates. */
export const DEFAULT_INSURANCE_MONTHLY = 3_000;
export const DEFAULT_MAINTENANCE_MONTHLY = 2_500;
export const DEFAULT_TYRES_MONTHLY = 800;
export const DEFAULT_ASSUMED_MILEAGE_KMPL = 15;

/** Optional FASTag / toll planning allowance (₹/month). */
export const DEFAULT_FASTAG_MONTHLY = 500;

export const INTEREST_RATE_HELP =
  "7.45% is used as the default planning rate. Actual rates vary by lender, credit profile, loan amount, tenure and offers.";

export const DATA_ASSUMPTIONS_TEXT =
  "Vehicle prices and ownership costs are estimates and may vary by city, variant, dealer, insurance provider, fuel prices and individual usage. Ex-showroom and estimated on-road figures are not live dealer quotes. CarWise is an educational affordability tool and does not provide financial advice.";
