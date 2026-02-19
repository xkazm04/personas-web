import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PlanHero from "@/components/sections/plan/PlanHero";
import CompletedPhases from "@/components/sections/plan/CompletedPhases";
import RemainingPhases from "@/components/sections/plan/RemainingPhases";
import DependencyGraph from "@/components/sections/plan/DependencyGraph";
import ScopeOverview from "@/components/sections/plan/ScopeOverview";

export const metadata = {
  title: "Personas — Implementation Roadmap",
  description: "15-phase implementation plan for the Personas AI agent platform: desktop app, cloud orchestrator, and marketing site.",
};

export default function PlanPage() {
  return (
    <>
      <Navbar />
      <main>
        <PlanHero />
        <CompletedPhases />
        <RemainingPhases />
        <DependencyGraph />
        <ScopeOverview />
      </main>
      <Footer />
    </>
  );
}
