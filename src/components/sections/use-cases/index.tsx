"use client";

import IllustrationSwitcher from "@/components/illustrate/IllustrationSwitcher";
import Current from "./UseCases.current";
import PersonaCard from "./UseCases.persona-card";
import SigilCore from "./UseCases.sigil-core";
import JobMatrix from "./UseCases.job-matrix";

/* /illustrate prototype: the use-cases section, current + three directions. */
const VARIANTS = [
  { key: "current", label: "Current", hint: "Tool grid and agent army", Component: Current },
  { key: "persona-card", label: "Persona card", hint: "One agent gains tools and jobs", Component: PersonaCard },
  { key: "sigil-core", label: "Sigil core", hint: "One identity, capabilities light up", Component: SigilCore },
  { key: "job-matrix", label: "Job matrix", hint: "Every tool by every job, one persona", Component: JobMatrix },
];

export default function UseCases() {
  return <IllustrationSwitcher section="use-cases" variants={VARIANTS} props={{}} />;
}
