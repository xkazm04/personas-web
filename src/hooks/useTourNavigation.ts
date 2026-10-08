"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { navigateDashboard } from "@/components/dashboard/spa/navigate";
import type { TourStep } from "@/lib/tour-script";

/**
 * Drives cross-page tour steps. When the active step declares a `route` that
 * differs from the current path, navigates there with `router.replace` (so the
 * auto-tour doesn't stack history entries). The dashboard tour lives entirely
 * under `/dashboard/*`, a single-page app, so a move between its views is a
 * `replaceState` that keeps the `TourProvider` — and the playing narration —
 * mounted.
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
    if (!route || route === pathname) return;
    if (route.startsWith("/dashboard/") && pathname.startsWith("/dashboard/")) {
      navigateDashboard(route, { replace: true });
    } else {
      router.replace(route);
    }
  }, [active, stepIndex, steps, pathname, router]);
}
