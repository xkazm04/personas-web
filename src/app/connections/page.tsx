import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import StageSection from "@/components/StageSection";
import PageShell from "@/components/PageShell";
import ConnectionsCatalog from "@/components/sections/ConnectionsCatalog";

const scrollMapItems = [
  { label: "CATALOG", href: "#connections-catalog" },
];

export default function Connections() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>
        {/* Spacer for fixed navbar */}
        <div className="h-24" />

        <StageSection glow="cyan" toColor="rgba(168,85,247,0.04)">
          <ConnectionsCatalog />
        </StageSection>
      </PageShell>
      <Footer />
    </>
  );
}
