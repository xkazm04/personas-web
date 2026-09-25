"use client";

import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { useTranslation } from "@/i18n/useTranslation";
import RunTwiceArt from "./memory-layers/RunTwiceArt";

/* /illustrate 1.1.0, variant "run-twice": the same task, run 1 versus run 12. */

export default function MemoryLayersRunTwice() {
  const copy = useTranslation().t.memorySection;
  return (
    <SectionWrapper fit="fill" id="memory-layers" className="overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.05)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.04)_0%,transparent_60%)]" />
      </div>

      <div className="text-center relative z-10" data-section-intro>
        <SectionHeading>
          {copy.heading}{" "}
          <GradientText className="drop-shadow-lg">{copy.headingGradient}</GradientText>
        </SectionHeading>
        <p data-section-lede className="mx-auto mt-4 max-w-xl text-foreground/85 font-light text-base md:text-lg">
          {copy.lede}
        </p>
      </div>

      <div className="relative z-10" data-stage-slot>
        <RunTwiceArt />
      </div>
    </SectionWrapper>
  );
}
