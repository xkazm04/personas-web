import Roadmap from "@/components/sections/Roadmap";
import FeatureVoting from "@/components/sections/FeatureVoting";
import StageSection from "@/components/StageSection";
import InfoPageLayout from "@/components/InfoPageLayout";

const scrollMapItems = [
  { label: "ROADMAP", href: "#roadmap" },
  { label: "VOTE", href: "#vote" },
];

const breadcrumbItems = [
  { label: "ROADMAP", href: "#roadmap", color: "#34d399" },
  { label: "VOTE", href: "#vote", color: "#a855f7" },
];

export default function RoadmapPage() {
  return (
    <InfoPageLayout scrollMapItems={scrollMapItems} breadcrumbItems={breadcrumbItems}>
      <StageSection glow="emerald" showTopLine={false} toColor="rgba(52,211,153,0.04)">
        <Roadmap />
      </StageSection>

      <StageSection glow="purple" fromColor="rgba(52,211,153,0.03)" toColor="rgba(168,85,247,0.04)">
        <FeatureVoting />
      </StageSection>
    </InfoPageLayout>
  );
}
