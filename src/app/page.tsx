import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Footer from "@/components/sections/Footer";
import {
  LazyDownloadCTA,
  LazyFAQ,
  LazyMidPageCTA,
  LazyPricing,
  LazyUseCases,
  LazyVision,
} from "@/components/sections/lazy";
import StageSection from "@/components/StageSection";
import SectionDivider from "@/components/SectionDivider";
import PageShell from "@/components/PageShell";

const scrollMapItems = [
  { label: "HERO", href: "#hero" },
  { label: "TOOLS", href: "#use-cases" },
  { label: "VISION", href: "#vision" },
  { label: "PRICING", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "DOWNLOAD", href: "#download" },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>

        <div id="hero">
          <Hero />
        </div>

        <SectionDivider from="cyan" to="emerald" />

        <StageSection glow="emerald" fromColor="rgba(6,182,212,0.03)" toColor="rgba(52,211,153,0.04)">
          <LazyUseCases />
        </StageSection>

        <SectionDivider from="emerald" to="purple" />

        <div id="vision">
          <StageSection glow="purple" fromColor="rgba(52,211,153,0.03)" toColor="rgba(168,85,247,0.04)">
            <LazyVision />
          </StageSection>
        </div>

        <LazyMidPageCTA />

        <SectionDivider from="purple" to="purple" />

        <StageSection glow="purple" fromColor="rgba(52,211,153,0.03)" toColor="rgba(168,85,247,0.04)">
          <LazyPricing />
        </StageSection>

        <SectionDivider from="purple" to="cyan" />

        <StageSection glow="cyan" fromColor="rgba(168,85,247,0.03)" toColor="rgba(6,182,212,0.04)">
          <LazyFAQ />
        </StageSection>

        <SectionDivider from="cyan" to="cyan" />

        <StageSection glow="cyan" fromColor="rgba(6,182,212,0.03)">
          <LazyDownloadCTA />
        </StageSection>
      </PageShell>
      <Footer />
    </>
  );
}
