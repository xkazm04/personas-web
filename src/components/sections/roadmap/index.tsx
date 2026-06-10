"use client";

import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import RoadmapProgress from "./components/RoadmapProgress";
import RoadmapAreas from "./components/RoadmapAreas";

export default function Roadmap() {
  return (
    <SectionWrapper id="roadmap">
      <SectionIntro
        heading="Product"
        gradient="Roadmap"
        description="Where each area of Personas stands today — fulfillment left to right, not promises top to bottom."
      />

      {/* Overall progress — most informative element first */}
      <RoadmapProgress />

      {/* Per-area fulfillment cards (the timeline's replacement) */}
      <RoadmapAreas />
    </SectionWrapper>
  );
}
