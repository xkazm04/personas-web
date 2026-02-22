import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import Roadmap from "@/components/sections/Roadmap";
import StageSection from "@/components/StageSection";
import PageShell from "@/components/PageShell";

const scrollMapItems = [{ label: "ROADMAP", href: "#roadmap" }];

export default function RoadmapPage() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        <StageSection glow="emerald" showTopLine={false} toColor="rgba(52,211,153,0.04)">
          <Roadmap />
        </StageSection>
      </PageShell>
      <Footer />
    </>
  );
}
