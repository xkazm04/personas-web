"use client";

import IllustrationSwitcher, { type IllustrationVariant } from "@/components/illustrate/IllustrationSwitcher";
import HealingCircuitCurrent from "./healing-circuit/index";
import HealingCircuitRemedies from "./HealingCircuit.remedies";
import HealingCircuitRunCard from "./HealingCircuit.run-card";
import HealingCircuitOvernight from "./HealingCircuit.overnight";

/* /illustrate r3 prototype: the current circuit board plus three directions, one
 * at a time; "current" is the default. Consolidation deletes the switcher. */

const VARIANTS: IllustrationVariant<object>[] = [
  { key: "current", label: "Current", hint: "Circuit board", Component: HealingCircuitCurrent },
  { key: "remedies", label: "Remedies", hint: "Four failures, four fixes", Component: HealingCircuitRemedies },
  { key: "run-card", label: "Run card", hint: "What you see in the app", Component: HealingCircuitRunCard },
  { key: "overnight", label: "Overnight", hint: "A night of runs, one issue left", Component: HealingCircuitOvernight },
];

export default function HealingCircuit() {
  return <IllustrationSwitcher section="healing" variants={VARIANTS} props={{}} />;
}
