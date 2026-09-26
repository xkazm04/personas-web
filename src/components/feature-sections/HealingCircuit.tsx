"use client";

import IllustrationSwitcher, { type IllustrationVariant } from "@/components/illustrate/IllustrationSwitcher";
import HealingCircuitCurrent from "./healing-circuit/index";
import HealingCircuitOvernight from "./HealingCircuit.overnight";

/* /illustrate round 3, owner decision 2026-09-26: "overnight" won the round, but
 * the owner wants it side by side with the current circuit board before deciding.
 * Two tabs, current first (default). The overnight copy stays in its WORDS const
 * until the pick is final; the final consolidation deletes this switcher and moves
 * the winner's copy into en.ts. */

const VARIANTS: IllustrationVariant<object>[] = [
  { key: "current", label: "Current", hint: "Circuit board", Component: HealingCircuitCurrent },
  { key: "overnight", label: "Overnight", hint: "A night of runs, one issue left", Component: HealingCircuitOvernight },
];

export default function HealingCircuit() {
  return <IllustrationSwitcher section="healing" variants={VARIANTS} props={{}} />;
}
