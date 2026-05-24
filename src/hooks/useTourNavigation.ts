"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { TourStep } from "@/lib/tour-script";

/**
 * Drives cross-page tour steps. When the active step declares a `route` that
 * differs from the current path, navigates there with `router.replace` (so the
 * auto-tour doesn't stack history entries). The dashboard tour lives entirely
 * under `/dashboard/*`, which shares one layout, so the navigation keeps the
 * `TourProvider` — and the playing narration — mounted across the move.
 */
export function useTourNavigation(
  active: boolean,
  stepIndex: number,
  steps: TourStep[],
): void {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!active || steps.length === 0) return;
    const route = steps[stepIndex]?.route;
    if (route && route !== pathname) router.replace(route);
  }, [active, stepIndex, steps, pathname, router]);
}
