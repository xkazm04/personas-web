"use client";

import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { useTranslation } from "@/i18n/useTranslation";
import LifecycleArt from "./LifecycleArt";
import LifecyclePhone from "./LifecyclePhone";

/**
 * GetStarted - the persona lifecycle over one week (/illustrate r3, "handoff"):
 * you set the agent up once; it runs on its own; the Overseer companion and the
 * Lab improve it, and each fix you approve makes it better.
 */
export default function GetStarted() {
  const copy = useTranslation().t.getStartedSection;
  return (
    // No id: page.tsx's always-present wrapper owns `get-started` (ids are unique
    // per document); `lib/landing-address.ts` finds this section by its label.
    <SectionWrapper fit="fill" aria-labelledby="get-started-heading">
      <div className="text-center" data-section-intro>
        <SectionHeading id="get-started-heading">
          {copy.heading} <GradientText className="drop-shadow-lg">{copy.headingGradient}</GradientText>
        </SectionHeading>
        <p data-section-lede className="mx-auto mt-4 max-w-3xl text-base font-light leading-relaxed text-foreground/85 md:text-lg">
          {copy.lede}
        </p>
      </div>
      <div data-stage-slot>
        <LifecycleArt />
        <LifecyclePhone />
      </div>
    </SectionWrapper>
  );
}
