import { STORAGE_KEYS } from "@/lib/storage/keys";
import { DEFAULT_FINANCIAL_PROFILE } from "@/lib/defaults";
import { EMPTY_CAR_PREFERENCES } from "@/types/preferences";
import type { FinancialProfile } from "@/types/finance";
import type { CarPreferences } from "@/types/preferences";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getJSON<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON<T>(key: string, value: T): void {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private mode — fail silently for MVP.
  }
}

export function removeKey(key: string): void {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getFinancialProfile(): FinancialProfile {
  return getJSON(STORAGE_KEYS.financialProfile, DEFAULT_FINANCIAL_PROFILE);
}

export function setFinancialProfile(profile: FinancialProfile): void {
  setJSON(STORAGE_KEYS.financialProfile, profile);
}

export function getCarPreferences(): CarPreferences {
  return getJSON(STORAGE_KEYS.carPreferences, EMPTY_CAR_PREFERENCES);
}

export function setCarPreferences(preferences: CarPreferences): void {
  setJSON(STORAGE_KEYS.carPreferences, preferences);
}

export function getSavedCars(): string[] {
  return getJSON(STORAGE_KEYS.savedCars, []);
}

export function setSavedCars(ids: string[]): void {
  setJSON(STORAGE_KEYS.savedCars, ids);
}

export function getCompareIds(): string[] {
  return getJSON(STORAGE_KEYS.compareIds, []);
}

export function setCompareIds(ids: string[]): void {
  setJSON(STORAGE_KEYS.compareIds, ids);
}

export function getOnboardingComplete(): boolean {
  return getJSON(STORAGE_KEYS.onboardingComplete, false);
}

export function setOnboardingComplete(complete: boolean): void {
  setJSON(STORAGE_KEYS.onboardingComplete, complete);
}

export function clearAllAppData(): void {
  Object.values(STORAGE_KEYS).forEach(removeKey);
}
