import InfoPageLayout from "@/components/InfoPageLayout";
import StageSection from "@/components/StageSection";
import DesignEngine from "@/components/feature-sections/DesignEngine";
import MemoryLayers from "@/components/feature-sections/MemoryLayers";
import HealingCircuit from "@/components/feature-sections/HealingCircuit";
import TriggerSystem from "@/components/feature-sections/TriggerSystem";
import ObservabilityDeck from "@/components/feature-sections/ObservabilityDeck";
import Lab from "@/components/feature-sections/Lab";
import Plugins from "@/components/feature-sections/Plugins";

const breadcrumbItems = [
  { label: "DESIGN", href: "#design", color: "#a855f7" },
  { label: "MEMORY", href: "#memory-layers", color: "#a855f7" },
  { label: "HEALING", href: "#healing-circuit", color: "#f43f5e" },
  { label: "TRIGGERS", href: "#triggers", color: "#fbbf24" },
  { label: "OBSERVE", href: "#observe", color: "#34d399" },
  { label: "LAB", href: "#lab", color: "#06b6d4" },
  { label: "PLUGINS", href: "#plugins", color: "#a855f7" },
];

const scrollMapItems = breadcrumbItems.map(({ label, href }) => ({ label, href }));

export default function TodoPage() {
  return (
    <InfoPageLayout scrollMapItems={scrollMapItems} breadcrumbItems={breadcrumbItems}>
      <StageSection glow="purple" showTopLine={false} toColor="purple">
        <DesignEngine />
      </StageSection>

      <StageSection glow="purple" fromColor="purple" toColor="purple">
        <MemoryLayers />
      </StageSection>

      <StageSection glow="emerald" fromColor="purple" toColor="rose">
        <HealingCircuit />
      </StageSection>

      <StageSection glow="cyan" fromColor="rose" toColor="cyan">
        <TriggerSystem />
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
