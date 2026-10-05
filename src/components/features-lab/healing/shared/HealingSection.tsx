"use client";

import type { ReactNode } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * The healing section's frame, shared by the lab variants: the live heading
 * (now from en.ts), a per-variant lede, and the stage slot the art fills. On
 * the desktop stage the slot is a size container, so art inside sizes itself
 * with `cqh` and always fits one viewport.
 */
export default function HealingSection({ lede, children }: { lede: string; children: ReactNode }) {
  const t = useTranslation().t.featuresLab.healing;
  return (
    <SectionWrapper fit="fill" id="healing-circuit" className="relative overflow-hidden">
      <div className="relative z-10 text-center" data-section-intro>
        <SectionHeading>
          {t.heading} <GradientText className="drop-shadow-lg">{t.headingGradient}</GradientText>
        </SectionHeading>
        <p
          data-section-lede
          className="mx-auto mt-4 max-w-3xl text-base font-light leading-relaxed text-foreground/85 md:text-lg"
        >
          {lede}
        </p>
      </div>
      <div data-stage-slot className="relative z-10 mt-8 stage:mt-0 stage:flex stage:flex-col stage:justify-center">
        {children}
      </div>
    </SectionWrapper>
  );
}
