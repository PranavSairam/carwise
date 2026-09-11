"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCarPreferences,
  setCarPreferences as persistPreferences,
} from "@/lib/storage/persistence";
import {
  EMPTY_CAR_PREFERENCES,
  type CarPreferences,
} from "@/types/preferences";

export function useCarPreferences() {
  const [preferences, setPreferencesState] =
    useState<CarPreferences>(EMPTY_CAR_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPreferencesState(getCarPreferences());
    setReady(true);
  }, []);

  const setPreferences = useCallback((next: CarPreferences) => {
    setPreferencesState(next);
    persistPreferences(next);
  }, []);

  const updatePreferences = useCallback((partial: Partial<CarPreferences>) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...partial };
      persistPreferences(next);
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferencesState(EMPTY_CAR_PREFERENCES);
    persistPreferences(EMPTY_CAR_PREFERENCES);
  }, []);

  return {
    preferences,
    setPreferences,
    updatePreferences,
    resetPreferences,
    ready,
  };
}
