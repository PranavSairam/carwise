"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useCarPreferences } from "@/hooks/useCarPreferences";
import { useCompare } from "@/hooks/useCompare";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useSavedCars } from "@/hooks/useSavedCars";
import { clearAllAppData } from "@/lib/storage/persistence";
import type { FinancialProfile } from "@/types/finance";
import type { CarPreferences } from "@/types/preferences";

interface AppContextValue {
  hydrated: boolean;
  profile: FinancialProfile;
  setProfile: (profile: FinancialProfile) => void;
  updateProfile: (partial: Partial<FinancialProfile>) => void;
  resetProfile: () => void;
  onboardingComplete: boolean;
  markOnboardingComplete: (complete?: boolean) => void;
  hasProfile: boolean;
  profileReady: boolean;
  preferences: CarPreferences;
  setPreferences: (preferences: CarPreferences) => void;
  updatePreferences: (partial: Partial<CarPreferences>) => void;
  resetPreferences: () => void;
  preferencesReady: boolean;
  savedIds: string[];
  toggleSaved: (carId: string) => void;
  isSaved: (carId: string) => boolean;
  clearSaved: () => void;
  compareIds: string[];
  toggleCompare: (carId: string) => boolean;
  removeFromCompare: (carId: string) => void;
  clearCompare: () => void;
  isComparing: (carId: string) => boolean;
  maxCompare: number;
  showWelcomeBack: boolean;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const hydrated = useHasHydrated();
  const financial = useFinancialProfile();
  const prefs = useCarPreferences();
  const saved = useSavedCars();
  const compare = useCompare();

  const showWelcomeBack =
    hydrated && financial.onboardingComplete && financial.ready;

  const value = useMemo<AppContextValue>(
    () => ({
      hydrated,
      profile: financial.profile,
      setProfile: financial.setProfile,
      updateProfile: financial.updateProfile,
      resetProfile: financial.resetProfile,
      onboardingComplete: financial.onboardingComplete,
      markOnboardingComplete: financial.markOnboardingComplete,
      hasProfile: financial.hasProfile,
      profileReady: financial.ready,
      preferences: prefs.preferences,
      setPreferences: prefs.setPreferences,
      updatePreferences: prefs.updatePreferences,
      resetPreferences: prefs.resetPreferences,
      preferencesReady: prefs.ready,
      savedIds: saved.savedIds,
      toggleSaved: saved.toggleSaved,
      isSaved: saved.isSaved,
      clearSaved: saved.clearSaved,
      compareIds: compare.compareIds,
      toggleCompare: compare.toggleCompare,
      removeFromCompare: compare.removeFromCompare,
      clearCompare: compare.clearCompare,
      isComparing: compare.isComparing,
      maxCompare: compare.maxCompare,
      showWelcomeBack,
      clearAllData: () => {
        clearAllAppData();
        financial.resetProfile();
        prefs.resetPreferences();
        saved.clearSaved();
        compare.clearCompare();
      },
    }),
    [
      hydrated,
      financial,
      prefs,
      saved,
      compare,
      showWelcomeBack,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
