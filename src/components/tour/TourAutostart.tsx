"use client";

import { useTourAutostart } from "@/hooks/useTourAutostart";
import type { TourId } from "@/lib/tour-script";

const NO_OPTIONS = {};

/**
 * Starts `tourId` on `?tour=1` wherever it is mounted, with no launcher. The
 * dashboard layout mounts it, so `/demo?tour=1` starts the dashboard tour on
 * the view `/demo` lands on (the Board) rather than only on Mission Control,
 * where the launcher button lives.
 */
export default function TourAutostart({ tourId }: { tourId: TourId }) {
  useTourAutostart(tourId, NO_OPTIONS);
  return null;
}
