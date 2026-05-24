"use client";

import { AnimatePresence } from "framer-motion";
import { useTour } from "@/contexts/TourContext";
import TourSpotlight from "./TourSpotlight";
import TourCaptionCard from "./TourCaptionCard";
import TourBridgeCard from "./TourBridgeCard";
import TourIntroCard from "./TourIntroCard";

/**
 * Mounts the tour surface: the welcome intro pop-up, then the spotlight +
 * caption while stepping, then the bridge prompt at the end. Rendered once by
 * `PageShell`, so every page wrapped in it inherits the tour.
 */
export default function TourOverlay() {
  const { active, atBridge, atIntro } = useTour();
  const stepping = active && !atBridge && !atIntro;
  return (
    <AnimatePresence>
      {active && atIntro && <TourIntroCard key="tour-intro" />}
      {stepping && <TourSpotlight key="tour-spotlight" />}
      {stepping && <TourCaptionCard key="tour-caption" />}
      {active && atBridge && <TourBridgeCard key="tour-bridge" />}
    </AnimatePresence>
  );
}
