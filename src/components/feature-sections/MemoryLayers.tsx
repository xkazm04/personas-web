"use client";

import IllustrationSwitcher from "@/components/illustrate/IllustrationSwitcher";
import Current from "./MemoryLayers.current";
import V_sediment from "./MemoryLayers.sediment";
import V_constellation from "./MemoryLayers.constellation";
import V_run_twice from "./MemoryLayers.run-twice";

/* /illustrate prototype (1.1.0, picture first): current + three directions. */
const VARIANTS = [
  { key: "current", label: "Current", hint: "Layered memory list", Component: Current },
  { key: "sediment", label: "Sediment", hint: "Every run settles into layers", Component: V_sediment },
  { key: "constellation", label: "Constellation", hint: "Memories link and light on recall", Component: V_constellation },
  { key: "run-twice", label: "Run 1 vs run 12", hint: "The same task, before and after memory", Component: V_run_twice },
];

export default function MemoryLayers() {
  return <IllustrationSwitcher section="memory" variants={VARIANTS} props={{}} />;
}
