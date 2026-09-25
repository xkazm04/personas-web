"use client";

import IllustrationSwitcher, { type IllustrationVariant } from "@/components/illustrate/IllustrationSwitcher";
import TeamCanvasCurrent from "./TeamCanvas.current";
import TeamCanvasRelay from "./TeamCanvas.relay";
import TeamCanvasMissions from "./TeamCanvas.missions";
import TeamCanvasRoster from "./TeamCanvas.roster";

/* /illustrate round 3 (skill 1.2.0): the current section plus three directions.
 * "current" is the default tab; `?illustrate=team-canvas:<key>` links a variant. */

const VARIANTS: IllustrationVariant<Record<string, never>>[] = [
  { key: "current", label: "Current", hint: "Assembly line + KPIs", Component: TeamCanvasCurrent },
  { key: "relay", label: "Relay", hint: "The step graph, with the QA loop", Component: TeamCanvasRelay },
  { key: "missions", label: "Missions", hint: "The app's Missions view", Component: TeamCanvasMissions },
  { key: "roster", label: "Roster", hint: "One goal, matched to the team", Component: TeamCanvasRoster },
];

export default function TeamCanvas() {
  return <IllustrationSwitcher section="team-canvas" variants={VARIANTS} props={{}} />;
}
