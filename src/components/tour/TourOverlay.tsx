"use client";

import { AnimatePresence } from "framer-motion";
import { useTour } from "@/contexts/TourContext";
import TourSpotlight from "./TourSpotlight";
import TourCaptionCard from "./TourCaptionCard";

/**
 * Mounts the spotlight + caption card while a tour is running. Rendered once
 * by `PageShell`, so every page wrapped in it inherits the tour surface.
 */
export default function TourOverlay() {
  const { active } = useTour();
  return (
    <AnimatePresence>
      {active && <TourSpotlight key="tour-spotlight" />}
      {active && <TourCaptionCard key="tour-caption" />}
    </AnimatePresence>
  );
}
