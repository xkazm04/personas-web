import Navbar from "@/components/Navbar";
import WhyAgents from "@/components/sections/WhyAgents";
import Features from "@/components/sections/Features";
import { LazyEventBusShowcase } from "@/components/sections/how-lazy";
import Footer from "@/components/sections/Footer";
import StageSection from "@/components/StageSection";
import CinematicBreather from "@/components/CinematicBreather";
import PageShell from "@/components/PageShell";
import SectionBreadcrumb from "@/components/SectionBreadcrumb";

const scrollMapItems = [
  { label: "AGENTS", href: "#why-agents" },
  { label: "PLATFORM", href: "#features" },
  { label: "EVENTS", href: "#event-bus" },
];

const breadcrumbItems = [
  { label: "AGENTS", href: "#why-agents", color: "#f43f5e" },
  { label: "PLATFORM", href: "#features", color: "#06b6d4" },
  { label: "EVENTS", href: "#event-bus", color: "#06b6d4" },
];

export default function HowItWorks() {
  return (
    <>
      <Navbar />
      <SectionBreadcrumb items={breadcrumbItems} />
      <PageShell scrollMapItems={scrollMapItems}>

        {/* Spacer for fixed navbar */}
        <div className="h-24" />

        <StageSection glow="purple" toColor="rgba(244,63,94,0.04)">
          <WhyAgents />
        </StageSection>

        <StageSection glow="cyan" fromColor="rgba(244,63,94,0.03)" toColor="rgba(6,182,212,0.04)">
          <Features />
        </StageSection>

        <CinematicBreather />

        <StageSection glow="cyan" fromColor="rgba(52,211,153,0.03)" toColor="rgba(6,182,212,0.04)">
          <LazyEventBusShowcase />
        </StageSection>
      </PageShell>
      <Footer />
    </>
  );
}
