"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TourProvider } from "@/contexts/TourContext";
import TourOverlay from "@/components/tour/TourOverlay";

/**
 * Lab scaffolding only. The live page mounts its hero inside PageShell, which
 * provides the guided-tour context; the /preview/lab-* frame does not. Under
 * /preview this supplies the same provider and overlay so the tour button
 * works in review; on the real page it is a pass-through.
 */
export default function LabTourScope({ children }: { children: ReactNode }) {
  const inLab = usePathname()?.startsWith("/preview") ?? false;
  if (!inLab) return <>{children}</>;
  return (
    <TourProvider>
      {children}
      <TourOverlay />
    </TourProvider>
  );
}
