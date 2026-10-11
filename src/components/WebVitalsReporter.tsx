"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect, useRef } from "react";
import { trackWebVital, type WebVitalName } from "@/lib/analytics";
import { normalizePathname } from "@/lib/route-key";

const TRACKED: ReadonlySet<string> = new Set<WebVitalName>(["LCP", "INP", "CLS"]);

/**
 * Field LCP / INP / CLS, tagged by the same normalized route PageViewTracker
 * uses. Reporting is consent-gated inside trackWebVital (queued, then dropped
 * or flushed). The route is read at report time: INP and CLS report late, on
 * page hide, so they are attributed to the route the visitor is on then.
 */
export default function WebVitalsReporter() {
  const pathname = usePathname();
  const route = useRef<string | null>(null);
  useEffect(() => {
    route.current = pathname ? normalizePathname(pathname) : null;
  }, [pathname]);

  useReportWebVitals((metric) => {
    if (!TRACKED.has(metric.name) || !route.current) return;
    trackWebVital(metric.name as WebVitalName, metric.value, route.current);
  });

  return null;
}
