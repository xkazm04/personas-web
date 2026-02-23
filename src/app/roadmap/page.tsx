import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import Roadmap from "@/components/sections/Roadmap";
import FeatureVoting from "@/components/sections/FeatureVoting";
import StageSection from "@/components/StageSection";
import PageShell from "@/components/PageShell";

const scrollMapItems = [
  { label: "ROADMAP", href: "#roadmap" },
  { label: "VOTE", href: "#vote" },
];

export default function RoadmapPage() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <StageSection glow="emerald" showTopLine={false} toColor="rgba(52,211,153,0.04)">
          <Roadmap />
        </StageSection>

        <StageSection glow="purple" fromColor="rgba(52,211,153,0.03)" toColor="rgba(168,85,247,0.04)">
          <FeatureVoting />
        </StageSection>
      </PageShell>
      <Footer />
    </>
  );
}
