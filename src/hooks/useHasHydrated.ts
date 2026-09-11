"use client";

import { useEffect, useState } from "react";

/** True after the first client mount — use to avoid SSR/localStorage mismatches. */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
