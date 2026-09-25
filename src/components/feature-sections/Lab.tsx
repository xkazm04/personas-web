"use client";

import IllustrationSwitcher, { type IllustrationVariant } from "@/components/illustrate/IllustrationSwitcher";
import LabCurrent from "./lab/index";
import LabHeadToHead from "./Lab.head-to-head";
import LabRatings from "./Lab.ratings";
import LabAnatomy from "./Lab.anatomy";

/* /illustrate r3 prototype: the current Lab plus three illustration directions.
 * Current stays the default tab; consolidation deletes this switcher. */

const VARIANTS: IllustrationVariant<Record<string, never>>[] = [
  { key: "current", label: "Current", hint: "Four tabs + version rail", Component: LabCurrent },
  { key: "head-to-head", label: "Head to head", hint: "New version vs live, same scenarios", Component: LabHeadToHead },
  { key: "ratings", label: "Ratings table", hint: "The Lab's real table, four rows", Component: LabRatings },
  { key: "anatomy", label: "Score anatomy", hint: "One rating, three judged parts", Component: LabAnatomy },
];

export default function Lab() {
  return <IllustrationSwitcher section="lab" variants={VARIANTS} props={{}} />;
}
