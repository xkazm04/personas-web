// Server component: the section is visually static, so it renders on the
// server with thin client wrappers (SectionWrapper/SectionIntro/RoadmapProgress/
// RoadmapAreas) handling only the motion. Deriving the area counts here (see
// roadmap-area-counts.ts) keeps the heavy template/connector catalogs entirely
// out of the client bundle — they are read at build time and passed down as
// plain data.
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import RoadmapProgress from "./components/RoadmapProgress";
import RoadmapAreas from "./components/RoadmapAreas";
import { AREA_COUNTS } from "./roadmap-area-counts";

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
      <RoadmapAreas counts={AREA_COUNTS} />
    </SectionWrapper>
  );
}
