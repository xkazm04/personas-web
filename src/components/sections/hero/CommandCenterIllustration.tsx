"use client";

import IllustrationSwitcher from "@/components/illustrate/IllustrationSwitcher";
import Current from "./CommandCenterIllustration.current";
import PersonaCard from "./CommandCenterIllustration.persona-card";
import ContactSheet from "./CommandCenterIllustration.contact-sheet";
import NightShift from "./CommandCenterIllustration.night-shift";

/* /illustrate prototype: the hero's illustration slot, current + three directions. */
export interface CommandCenterIllustrationProps {
  publicBetaLabel: string;
}

const VARIANTS = [
  { key: "current", label: "Current", hint: "Command-center ring", Component: Current },
  { key: "persona-card", label: "Persona card", hint: "One agent finishing a real run", Component: PersonaCard },
  { key: "contact-sheet", label: "Contact sheet", hint: "A sentence develops into an agent", Component: ContactSheet },
  { key: "night-shift", label: "Night shift", hint: "Scheduled runs while you are away", Component: NightShift },
];

export default function CommandCenterIllustration(props: CommandCenterIllustrationProps) {
  return <IllustrationSwitcher section="hero" variants={VARIANTS} props={props} align="start" />;
}
