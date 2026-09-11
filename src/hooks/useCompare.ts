"use client";

import { useCallback, useEffect, useState } from "react";
import { MAX_COMPARE_CARS } from "@/lib/defaults";
import {
  getCompareIds,
  setCompareIds as persistCompareIds,
} from "@/lib/storage/persistence";

export function useCompare() {
  const [compareIds, setCompareIdsState] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompareIdsState(getCompareIds());
    setReady(true);
  }, []);

  const setCompareIds = useCallback((ids: string[]) => {
    const limited = ids.slice(0, MAX_COMPARE_CARS);
    setCompareIdsState(limited);
    persistCompareIds(limited);
  }, []);

  const toggleCompare = useCallback((carId: string): boolean => {
    let accepted = true;
    setCompareIdsState((prev) => {
      if (prev.includes(carId)) {
        const next = prev.filter((id) => id !== carId);
        persistCompareIds(next);
        return next;
      }
      if (prev.length >= MAX_COMPARE_CARS) {
        accepted = false;
        return prev;
      }
      const next = [...prev, carId];
      persistCompareIds(next);
      return next;
    });
    return accepted;
  }, []);

  const removeFromCompare = useCallback((carId: string) => {
    setCompareIdsState((prev) => {
      const next = prev.filter((id) => id !== carId);
      persistCompareIds(next);
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIdsState([]);
    persistCompareIds([]);
  }, []);

  const isComparing = useCallback(
    (carId: string) => compareIds.includes(carId),
    [compareIds],
  );

  return {
    compareIds,
    setCompareIds,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    isComparing,
    ready,
    maxCompare: MAX_COMPARE_CARS,
  };
}
