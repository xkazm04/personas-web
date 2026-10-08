"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import { CASES, TOOLS } from "./catalog";
import { useCasesPersonaCopy } from "@/i18n/pending/useCasesPersona";
import { landingSectionsCopy } from "@/i18n/pending/landingSections";

/** The words the animations use: heading, persona name, need labels, the art's name and the per-case status line. */
export function useCaseCopy() {
  const { t } = useTranslation();
  const copy = landingSectionsCopy.useCases;
  const persona = useCasesPersonaCopy.personaName;
  return {
    heading: t.useCasesSection.heading,
    gradient: t.useCasesSection.headingGradient,
    persona,
    personaDescription: useCasesPersonaCopy.personaDescription,
    capabilities: copy.capabilities,
    artLabel: fillTemplate(copy.artLabel, { persona }),
    need: (i: number) => copy.needs[CASES[i].need],
    jobsCount: (count: number) => fillTemplate(copy.jobsCount, { count, total: CASES.length }),
    status: (i: number) =>
      fillTemplate(copy.status, {
        n: i + 1,
        total: CASES.length,
        need: copy.needs[CASES[i].need],
        tool: TOOLS[CASES[i].chosen].label,
        options: CASES[i].candidates.map((k) => TOOLS[k].label).join(", "),
      }),
  };
}

export type CaseCopy = ReturnType<typeof useCaseCopy>;
