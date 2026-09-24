"use client";

import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import RunTwiceArt from "./MemoryLayers.run-twice.art";

/* /illustrate 1.1.0, variant "run-twice": the same task, run 1 versus run 12. */

export default function MemoryLayersRunTwice() {
  return (
    <SectionWrapper id="memory-layers" className="relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.05)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.04)_0%,transparent_60%)]" />
      </div>

      <div className="text-center relative z-10">
        <SectionHeading>
          Remembers what{" "}
          <GradientText className="drop-shadow-lg">works</GradientText>
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-xl text-foreground/85 font-light text-base md:text-lg">
          Your agents get better the more they work.
        </p>
      </div>

      <div className="relative z-10">
        <RunTwiceArt />
      </div>
    </SectionWrapper>
  );
}
