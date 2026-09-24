"use client";

import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import ConstellationArt from "./MemoryLayers.constellation.art";

export default function MemoryLayersConstellation() {
  return (
    <SectionWrapper id="memory-layers" className="relative overflow-hidden">
      <div className="text-center relative z-10">
        <SectionHeading>
          Remembers what{" "}
          <GradientText className="drop-shadow-lg">works</GradientText>
        </SectionHeading>
        <p className="mx-auto mt-4 max-w-xl text-foreground/85 font-light text-base md:text-lg">
          Your agents get better the more they work.
        </p>
      </div>

      <div className="mt-10 relative z-10">
        <ConstellationArt />
      </div>
    </SectionWrapper>
  );
}
