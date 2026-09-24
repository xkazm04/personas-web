"use client";

import IllustrationSwitcher from "@/components/illustrate/IllustrationSwitcher";
import Current from "./VisionGrid.current";
import RealSurfaces from "./VisionGrid.real-surfaces";
import LayerStack from "./VisionGrid.layer-stack";
import RealNouns from "./VisionGrid.real-nouns";

/* /illustrate prototype: the platform section, current + three directions. */
const VARIANTS = [
  { key: "current", label: "Current", hint: "Six branded paintings", Component: Current },
  { key: "real-surfaces", label: "Real surfaces", hint: "Each layer as its actual screen", Component: RealSurfaces },
  { key: "layer-stack", label: "Layer stack", hint: "What sits beneath one agent", Component: LayerStack },
  { key: "real-nouns", label: "Real nouns", hint: "Each layer drawn from its real catalogue", Component: RealNouns },
];

export default function VisionGrid() {
  return <IllustrationSwitcher section="vision" variants={VARIANTS} props={{}} />;
}
