import InfoPageLayout from "@/components/InfoPageLayout";
import StageSection from "@/components/StageSection";

export const dynamic = "force-static";
export const revalidate = 3600;

import DesignEngine from "@/components/feature-sections/DesignEngine";
import MemoryLayers from "@/components/feature-sections/MemoryLayers";
import HealingCircuit from "@/components/feature-sections/HealingCircuit";
import ObservabilityDeck from "@/components/feature-sections/ObservabilityDeck";
import Lab from "@/components/feature-sections/Lab";
import Plugins from "@/components/feature-sections/Plugins";
import SecurityVault from "@/components/feature-sections/SecurityVault";
import MultiProviderAI from "@/components/feature-sections/MultiProviderAI";

const scrollMapItems = [
  { label: "DESIGN", href: "#design" },
  { label: "MEMORY", href: "#memory-layers" },
  { label: "HEALING", href: "#healing-circuit" },
  { label: "SECURITY", href: "#security" },
  { label: "AI MODELS", href: "#multi-provider" },
  { label: "OBSERVE", href: "#observe" },
  { label: "LAB", href: "#lab" },
  { label: "PLUGINS", href: "#plugins" },
];

export default function FeaturesPage() {
  return (
    <InfoPageLayout
      scrollMapItems={scrollMapItems}
      tourId="features"
      tourBridgeHref="/demo?tour=1"
      tourBridgeKey="dashboard"
    >
      <StageSection glow="purple" showTopLine={false} toColor="purple">
        <DesignEngine />
      </StageSection>

      <StageSection glow="purple" fromColor="purple" toColor="purple">
        <MemoryLayers />
      </StageSection>

      <StageSection glow="emerald" fromColor="purple" toColor="rose">
        <HealingCircuit />
      </StageSection>

      <StageSection glow="emerald" fromColor="rose" toColor="rose">
        <SecurityVault />
      </StageSection>

      <StageSection glow="cyan" fromColor="rose" toColor="cyan">
        <MultiProviderAI />
      </StageSection>

      <StageSection glow="emerald" fromColor="cyan" toColor="emerald">
        <ObservabilityDeck />
      </StageSection>

      <StageSection glow="cyan" fromColor="emerald" toColor="cyan">
        <Lab />
      </StageSection>

      <StageSection glow="purple" fromColor="cyan" toColor="purple">
        <Plugins />
      </StageSection>
    </InfoPageLayout>
  );
}
