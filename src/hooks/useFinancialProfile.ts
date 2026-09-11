"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FINANCIAL_PROFILE } from "@/lib/defaults";
import {
  getFinancialProfile,
  getOnboardingComplete,
  setFinancialProfile as persistProfile,
  setOnboardingComplete as persistOnboarding,
} from "@/lib/storage/persistence";
import type { FinancialProfile } from "@/types/finance";

export function useFinancialProfile() {
  const [profile, setProfileState] = useState<FinancialProfile>(
    DEFAULT_FINANCIAL_PROFILE,
  );
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfileState(getFinancialProfile());
    setOnboardingCompleteState(getOnboardingComplete());
    setReady(true);
  }, []);

  const setProfile = useCallback((next: FinancialProfile) => {
    setProfileState(next);
    persistProfile(next);
  }, []);

  const updateProfile = useCallback((partial: Partial<FinancialProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...partial };
      persistProfile(next);
      return next;
    });
  }, []);

  const markOnboardingComplete = useCallback((complete = true) => {
    setOnboardingCompleteState(complete);
    persistOnboarding(complete);
  }, []);

  const resetProfile = useCallback(() => {
    setProfileState(DEFAULT_FINANCIAL_PROFILE);
    persistProfile(DEFAULT_FINANCIAL_PROFILE);
    setOnboardingCompleteState(false);
    persistOnboarding(false);
  }, []);

  return {
    profile,
    setProfile,
    updateProfile,
    resetProfile,
    onboardingComplete,
    markOnboardingComplete,
    ready,
    hasProfile: onboardingComplete,
  };
}
