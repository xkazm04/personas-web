import InfoPageLayout from "@/components/InfoPageLayout";
import StageSection from "@/components/StageSection";
import DesignEngine from "@/components/todo/DesignEngine";
import MemoryLayers from "@/components/todo/MemoryLayers";
import HealingCircuit from "@/components/todo/HealingCircuit";
import TriggerSystem from "@/components/todo/TriggerSystem";
import ObservabilityDeck from "@/components/todo/ObservabilityDeck";
import Lab from "@/components/todo/Lab";
import Plugins from "@/components/todo/Plugins";

const scrollMapItems = [
  { label: "DESIGN", href: "#design" },
  { label: "MEMORY", href: "#memory-layers" },
  { label: "HEALING", href: "#healing-circuit" },
  { label: "TRIGGERS", href: "#triggers" },
  { label: "OBSERVE", href: "#observe" },
  { label: "LAB", href: "#lab" },
  { label: "PLUGINS", href: "#plugins" },
];

const breadcrumbItems = [
  { label: "DESIGN", href: "#design", color: "#a855f7" },
  { label: "MEMORY", href: "#memory-layers", color: "#a855f7" },
  { label: "HEALING", href: "#healing-circuit", color: "#f43f5e" },
  { label: "TRIGGERS", href: "#triggers", color: "#fbbf24" },
  { label: "OBSERVE", href: "#observe", color: "#34d399" },
  { label: "LAB", href: "#lab", color: "#06b6d4" },
  { label: "PLUGINS", href: "#plugins", color: "#a855f7" },
];

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
