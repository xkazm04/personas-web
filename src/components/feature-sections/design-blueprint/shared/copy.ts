"use client";

import { useMemo } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import { DIMS, type Dim, type DimKey } from "./dims";
import { designMatrixCopy } from "@/i18n/pending/designMatrix";

export interface DimCopy extends Dim {
  label: string;
  /** The resolved decision (for an asked dimension: the default answer). */
  value: string;
  question?: { prompt: string; options: string[]; picked: number };
  /** The words in the sentence that drove this decision, if any. */
  keyword?: string;
}

/** Default answers, as the live matrix pre-picks them. */
const PICKED: Partial<Record<DimKey, number>> = { triggers: 0, review: 1 };

/**
 * Every word the variants show: the live section's `designMatrix` copy
 * (heading, sentence, the eight decisions and the two questions) joined with
 * the lab's own `featuresSections.design` labels.
 */
export function useDesignCopy() {
  const { t } = useTranslation();
  const m = designMatrixCopy;
  const l = t.featuresSections.design;
  return useMemo(() => {
    const keywords = l.keywords as Partial<Record<DimKey, string>>;
    const dims: DimCopy[] = DIMS.map((d) => {
      const q = d.key === "triggers" || d.key === "review" ? m.questions[d.key] : undefined;
      return {
        ...d,
        label: m.cells[d.key].label,
        value: m.cells[d.key].value,
        question: q && { prompt: q.prompt, options: q.options, picked: PICKED[d.key] ?? 0 },
        keyword: keywords[d.key],
      };
    });
    return {
      heading: m.heading,
      headingGradient: m.headingGradient,
      headingTrailing: m.headingTrailing,
      lede: m.lede,
      ledeStrong: m.ledeStrong,
      sentence: m.userPrompt,
      title: m.title,
      dims,
      lab: l,
      decided: (n: number) => fillTemplate(l.decided, { n, total: dims.length }),
    };
  }, [m, l]);
}

export type DesignCopy = ReturnType<typeof useDesignCopy>;

/** The decision a dimension shows, honouring the visitor's answer. */
export function valueOf(d: DimCopy, answers: Partial<Record<DimKey, number>>): string {
  if (!d.question) return d.value;
  const i = answers[d.key];
  return i === undefined || i === d.question.picked ? d.value : d.question.options[i];
}
