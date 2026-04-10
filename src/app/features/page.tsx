import InfoPageLayout from "@/components/InfoPageLayout";
import StageSection from "@/components/StageSection";
import DesignEngine from "@/components/todo/DesignEngine";
import GenomeTree from "@/components/todo/GenomeTree";
import MemoryLayers from "@/components/todo/MemoryLayers";
import HealingCircuit from "@/components/todo/HealingCircuit";
import TriggerSystem from "@/components/todo/TriggerSystem";
import ObservabilityDeck from "@/components/todo/ObservabilityDeck";
import DevToolsSuite from "@/components/todo/DevToolsSuite";
import SecurityVault from "@/components/todo/SecurityVault";
import MultiProviderAI from "@/components/todo/MultiProviderAI";

const scrollMapItems = [
  { label: "DESIGN", href: "#design" },
  { label: "GENOME", href: "#genome-tree" },
  { label: "MEMORY", href: "#memory-layers" },
  { label: "HEALING", href: "#healing-circuit" },
  { label: "TRIGGERS", href: "#triggers" },
  { label: "SECURITY", href: "#security" },
  { label: "AI MODELS", href: "#multi-provider" },
  { label: "OBSERVE", href: "#observe" },
  { label: "DEVTOOLS", href: "#devtools" },
];

const breadcrumbItems = [
  { label: "DESIGN", href: "#design", color: "#a855f7" },
  { label: "GENOME", href: "#genome-tree", color: "#06b6d4" },
  { label: "MEMORY", href: "#memory-layers", color: "#a855f7" },
  { label: "HEALING", href: "#healing-circuit", color: "#f43f5e" },
  { label: "TRIGGERS", href: "#triggers", color: "#fbbf24" },
  { label: "SECURITY", href: "#security", color: "#f43f5e" },
  { label: "AI MODELS", href: "#multi-provider", color: "#3b82f6" },
  { label: "OBSERVE", href: "#observe", color: "#34d399" },
  { label: "DEVTOOLS", href: "#devtools", color: "#a855f7" },
];

export default function FeaturesPage() {
  return (
    <InfoPageLayout scrollMapItems={scrollMapItems} breadcrumbItems={breadcrumbItems}>
      <StageSection glow="purple" showTopLine={false} toColor="purple">
        <DesignEngine />
      </StageSection>

      <StageSection glow="cyan" fromColor="purple" toColor="cyan">
        <GenomeTree />
      </StageSection>

      <StageSection glow="purple" fromColor="cyan" toColor="purple">
        <MemoryLayers />
      </StageSection>

      <StageSection glow="emerald" fromColor="purple" toColor="rose">
        <HealingCircuit />
      </StageSection>

      <StageSection glow="cyan" fromColor="rose" toColor="cyan">
        <TriggerSystem />
      </StageSection>

      <StageSection glow="emerald" fromColor="cyan" toColor="rose">
        <SecurityVault />
      </StageSection>

      <StageSection glow="cyan" fromColor="rose" toColor="cyan">
        <MultiProviderAI />
      </StageSection>

      <StageSection glow="emerald" fromColor="cyan" toColor="emerald">
        <ObservabilityDeck />
      </StageSection>

      <StageSection glow="purple" fromColor="emerald" toColor="purple">
        <DevToolsSuite />
      </StageSection>
    </InfoPageLayout>
  );
}
