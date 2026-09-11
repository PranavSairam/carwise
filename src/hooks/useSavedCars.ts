"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSavedCars,
  setSavedCars as persistSavedCars,
} from "@/lib/storage/persistence";

export function useSavedCars() {
  const [savedIds, setSavedIdsState] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSavedIdsState(getSavedCars());
    setReady(true);
  }, []);

  const setSavedIds = useCallback((ids: string[]) => {
    setSavedIdsState(ids);
    persistSavedCars(ids);
  }, []);

  const toggleSaved = useCallback((carId: string) => {
    setSavedIdsState((prev) => {
      const next = prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : [...prev, carId];
      persistSavedCars(next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (carId: string) => savedIds.includes(carId),
    [savedIds],
  );

  const clearSaved = useCallback(() => {
    setSavedIdsState([]);
    persistSavedCars([]);
  }, []);

  return {
    savedIds,
    setSavedIds,
    toggleSaved,
    isSaved,
    clearSaved,
    ready,
  };
}
