"use client";

import { AnimatePresence } from "framer-motion";
import { useTour } from "@/contexts/TourContext";
import TourSpotlight from "./TourSpotlight";
import TourCaptionCard from "./TourCaptionCard";
import TourBridgeCard from "./TourBridgeCard";

/**
 * Mounts the spotlight + caption card while a tour is running, or the bridge
 * prompt at the end. Rendered once by `PageShell`, so every page wrapped in it
 * inherits the tour surface.
 */
export default function TourOverlay() {
  const { active, atBridge } = useTour();
  return (
    <AnimatePresence>
      {active && !atBridge && <TourSpotlight key="tour-spotlight" />}
      {active && !atBridge && <TourCaptionCard key="tour-caption" />}
      {active && atBridge && <TourBridgeCard key="tour-bridge" />}
    </AnimatePresence>
  );
}
