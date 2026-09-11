export type BodyType = "Hatchback" | "Sedan" | "SUV" | "MUV" | "MPV" | "Luxury";
export type FuelType = "Petrol" | "Diesel" | "CNG" | "Hybrid" | "EV";
export type TransmissionType = "Manual" | "Automatic" | "AMT" | "DCT" | "CVT";
export type PurchaseType = "New" | "Used";
export type DataConfidence = "verified" | "estimated" | "placeholder";

export interface CityOnRoadPrice {
  cityId: string;
  onRoadPrice: number;
  confidence: DataConfidence;
}

export interface Car {
  id: string;
  brand: string;
  brandId: string;
  model: string;
  variant: string;
  bodyType: BodyType;
  fuel: FuelType;
  transmission: TransmissionType;
  seats: number;
  exShowroomPrice: number;
  estimatedOnRoadPrice: number;
  cityPrices?: CityOnRoadPrice[];
  mileage: number;
  powerBhp?: number;
  engineCc?: number;
  bootSpaceLitres?: number;
  warrantyYears?: number;
  warrantyKm?: number;
  maintenanceMonthlyEstimate: number;
  insuranceAnnualEstimate: number;
  tyreConsumablesMonthlyEstimate: number;
  fuelEfficiencyUnit: "kmpl" | "km_per_kwh";
  electricityRatePerKwh?: number;
  image: string;
  purchaseType: PurchaseType;
  /** Prefer dataStatus in UI; dataConfidence kept for existing car rows. */
  dataConfidence: DataConfidence;
  /** Explicit reliability flag when set; otherwise derived from dataConfidence. */
  dataStatus?: "verified" | "estimated";
  source: string;
  lastUpdated: string;
  tags?: string[];
  featured?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  featured: boolean;
}

export interface City {
  id: string;
  name: string;
  state: string;
  rtoFactor: number;
  isDefault?: boolean;
}

export interface CarFilters {
  brandId?: string;
  bodyType?: BodyType;
  fuel?: FuelType;
  transmission?: TransmissionType;
  purchaseType?: PurchaseType;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  featured?: boolean;
  tags?: string[];
  query?: string;
}
