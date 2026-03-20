import InfoPageLayout from "@/components/InfoPageLayout";
import StageSection from "@/components/StageSection";
import DesignEngine from "@/components/todo/DesignEngine";
import LabHeatmap from "@/components/todo/LabHeatmap";
import GenomeTree from "@/components/todo/GenomeTree";
import MemoryLayers from "@/components/todo/MemoryLayers";
import HealingCircuit from "@/components/todo/HealingCircuit";
import TriggerSystem from "@/components/todo/TriggerSystem";
import ObservabilityDeck from "@/components/todo/ObservabilityDeck";
import DevToolsSuite from "@/components/todo/DevToolsSuite";

const scrollMapItems = [
  { label: "DESIGN", href: "#design" },
  { label: "LAB", href: "#lab-heatmap" },
  { label: "GENOME", href: "#genome-tree" },
  { label: "MEMORY", href: "#memory-layers" },
  { label: "HEALING", href: "#healing-circuit" },
  { label: "TRIGGERS", href: "#triggers" },
  { label: "OBSERVE", href: "#observe" },
  { label: "DEVTOOLS", href: "#devtools" },
];

const breadcrumbItems = [
  { label: "DESIGN", href: "#design", color: "#a855f7" },
  { label: "LAB", href: "#lab-heatmap", color: "#fbbf24" },
  { label: "GENOME", href: "#genome-tree", color: "#06b6d4" },
  { label: "MEMORY", href: "#memory-layers", color: "#a855f7" },
  { label: "HEALING", href: "#healing-circuit", color: "#f43f5e" },
  { label: "TRIGGERS", href: "#triggers", color: "#fbbf24" },
  { label: "OBSERVE", href: "#observe", color: "#34d399" },
  { label: "DEVTOOLS", href: "#devtools", color: "#a855f7" },
];

export default function TodoPage() {
  return (
    <InfoPageLayout scrollMapItems={scrollMapItems} breadcrumbItems={breadcrumbItems}>
      <StageSection glow="purple" showTopLine={false} toColor="purple">
        <DesignEngine />
      </StageSection>

      <StageSection glow="emerald" fromColor="purple" toColor="amber">
        <LabHeatmap />
      </StageSection>

      <StageSection glow="cyan" fromColor="amber" toColor="cyan">
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

      <StageSection glow="emerald" fromColor="cyan" toColor="emerald">
        <ObservabilityDeck />
      </StageSection>

      <StageSection glow="purple" fromColor="emerald" toColor="purple">
        <DevToolsSuite />
      </StageSection>
    </InfoPageLayout>
  );
}
