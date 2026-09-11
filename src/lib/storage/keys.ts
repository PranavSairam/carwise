export const STORAGE_KEYS = {
  financialProfile: "carwise:financial-profile",
  carPreferences: "carwise:car-preferences",
  savedCars: "carwise:saved-cars",
  compareIds: "carwise:compare-ids",
  onboardingComplete: "carwise:onboarding-complete",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
