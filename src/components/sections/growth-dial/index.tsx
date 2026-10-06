"use client";

import { useWide } from "./shared/useWide";
import LayersGrowthDial from "./Main";
import PhoneDial from "./PhoneDial";

/** How lab - Built to grow, V2 "Growth dial". Under 64rem the dial is redrawn at phone size. */
export default function HowLabLayersV2() {
  return useWide() ? <LayersGrowthDial /> : <PhoneDial />;
}
