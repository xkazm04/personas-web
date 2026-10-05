"use client";

import type { ReactNode } from "react";
import { TourProvider } from "@/contexts/TourContext";
import TourOverlay from "@/components/tour/TourOverlay";

/**
 * LAB ONLY. On the live landing, PageShell already provides the tour context
 * and overlay; the /preview harness does not, and the hero's tour launcher
 * throws without it. Drop this wrapper when a variant is promoted.
 */
export default function LabTour({ children }: { children: ReactNode }) {
  return (
    <TourProvider>
      {children}
      <TourOverlay />
    </TourProvider>
  );
}
