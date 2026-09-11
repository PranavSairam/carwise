import type {
  BodyType,
  FuelType,
  PurchaseType,
  TransmissionType,
} from "@/types/car";

export type SeatingPreference = "4/5" | "6/7" | "8+";

export interface CarPreferences {
  bodyTypes: BodyType[];
  fuels: FuelType[];
  transmissions: TransmissionType[];
  seating: SeatingPreference[];
  purchaseTypes: PurchaseType[];
  brandIds: string[];
  maxPrice?: number;
  query?: string;
}

export const EMPTY_CAR_PREFERENCES: CarPreferences = {
  bodyTypes: [],
  fuels: [],
  transmissions: [],
  seating: [],
  purchaseTypes: [],
  brandIds: [],
};
