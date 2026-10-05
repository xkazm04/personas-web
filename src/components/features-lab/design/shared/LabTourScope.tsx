"use client";

import type { ReactNode } from "react";
import { TourProvider } from "@/contexts/TourContext";

/**
 * LAB ONLY. The /preview harness mounts a section without the page shell, so
 * there is no TourProvider and the tour launcher (which calls `useTour()`)
 * would throw. On /features the provider comes from PageShell: when a variant
 * is promoted, mount its named section component and drop this wrapper.
 */
export default function LabTourScope({ children }: { children: ReactNode }) {
  return <TourProvider>{children}</TourProvider>;
}
