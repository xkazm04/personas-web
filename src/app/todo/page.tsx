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
      <StageSection glow="purple" showTopLine={false} toColor="rgba(168,85,247,0.04)">
        <DesignEngine />
      </StageSection>

      <StageSection glow="emerald" fromColor="rgba(168,85,247,0.03)" toColor="rgba(251,191,36,0.04)">
        <LabHeatmap />
      </StageSection>

      <StageSection glow="cyan" fromColor="rgba(251,191,36,0.03)" toColor="rgba(6,182,212,0.04)">
        <GenomeTree />
      </StageSection>

      <StageSection glow="purple" fromColor="rgba(6,182,212,0.03)" toColor="rgba(168,85,247,0.04)">
        <MemoryLayers />
      </StageSection>

      <StageSection glow="emerald" fromColor="rgba(168,85,247,0.03)" toColor="rgba(244,63,94,0.04)">
        <HealingCircuit />
      </StageSection>

      <StageSection glow="cyan" fromColor="rgba(244,63,94,0.03)" toColor="rgba(6,182,212,0.04)">
        <TriggerSystem />
      </StageSection>

      <StageSection glow="emerald" fromColor="rgba(6,182,212,0.03)" toColor="rgba(52,211,153,0.04)">
        <ObservabilityDeck />
      </StageSection>

      <StageSection glow="purple" fromColor="rgba(52,211,153,0.03)" toColor="rgba(168,85,247,0.04)">
        <DevToolsSuite />
      </StageSection>
    </InfoPageLayout>
  );
}
