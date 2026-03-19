import InfoPageLayout from "@/components/InfoPageLayout";
import StageSection from "@/components/StageSection";
import TodoHero from "@/components/todo/TodoHero";
import CredentialVault from "@/components/todo/CredentialVault";
import DesignEngine from "@/components/todo/DesignEngine";
import LabArena from "@/components/todo/LabArena";
import TeamCanvas from "@/components/todo/TeamCanvas";
import PromptGenome from "@/components/todo/PromptGenome";
import MemorySystem from "@/components/todo/MemorySystem";
import HealingEngine from "@/components/todo/HealingEngine";
import TriggerSystem from "@/components/todo/TriggerSystem";
import DeployTargets from "@/components/todo/DeployTargets";
import ObservabilityDeck from "@/components/todo/ObservabilityDeck";
import BundleSharing from "@/components/todo/BundleSharing";
import DevToolsSuite from "@/components/todo/DevToolsSuite";
import ConnectorGrid from "@/components/todo/ConnectorGrid";

const scrollMapItems = [
  { label: "OVERVIEW", href: "#overview" },
  { label: "VAULT", href: "#vault" },
  { label: "DESIGN", href: "#design" },
  { label: "LAB", href: "#lab" },
  { label: "TEAMS", href: "#teams" },
  { label: "GENOME", href: "#genome" },
  { label: "MEMORY", href: "#memory" },
  { label: "HEALING", href: "#healing" },
  { label: "TRIGGERS", href: "#triggers" },
  { label: "DEPLOY", href: "#deploy" },
  { label: "OBSERVE", href: "#observe" },
  { label: "SHARING", href: "#sharing" },
  { label: "DEVTOOLS", href: "#devtools" },
  { label: "CONNECT", href: "#connectors" },
];

const breadcrumbItems = [
  { label: "OVERVIEW", href: "#overview", color: "#06b6d4" },
  { label: "VAULT", href: "#vault", color: "#f43f5e" },
  { label: "DESIGN", href: "#design", color: "#a855f7" },
  { label: "LAB", href: "#lab", color: "#fbbf24" },
  { label: "TEAMS", href: "#teams", color: "#34d399" },
  { label: "DEPLOY", href: "#deploy", color: "#60a5fa" },
  { label: "CONNECT", href: "#connectors", color: "#06b6d4" },
];

export default function TodoPage() {
  return (
    <InfoPageLayout scrollMapItems={scrollMapItems} breadcrumbItems={breadcrumbItems}>
      <StageSection glow="cyan" showTopLine={false} toColor="rgba(6,182,212,0.04)">
        <TodoHero />
      </StageSection>

      <StageSection glow="purple" fromColor="rgba(6,182,212,0.03)" toColor="rgba(244,63,94,0.04)">
        <CredentialVault />
      </StageSection>

      <StageSection glow="cyan" fromColor="rgba(244,63,94,0.03)" toColor="rgba(168,85,247,0.04)">
        <DesignEngine />
      </StageSection>

      <StageSection glow="emerald" fromColor="rgba(168,85,247,0.03)" toColor="rgba(251,191,36,0.04)">
        <LabArena />
      </StageSection>

      <StageSection glow="purple" fromColor="rgba(251,191,36,0.03)" toColor="rgba(52,211,153,0.04)">
        <TeamCanvas />
      </StageSection>

      <StageSection glow="cyan" fromColor="rgba(52,211,153,0.03)" toColor="rgba(168,85,247,0.04)">
        <PromptGenome />
      </StageSection>

      <StageSection glow="purple" fromColor="rgba(168,85,247,0.03)" toColor="rgba(6,182,212,0.04)">
        <MemorySystem />
      </StageSection>

      <StageSection glow="emerald" fromColor="rgba(6,182,212,0.03)" toColor="rgba(52,211,153,0.04)">
        <HealingEngine />
      </StageSection>

      <StageSection glow="cyan" fromColor="rgba(52,211,153,0.03)" toColor="rgba(6,182,212,0.04)">
        <TriggerSystem />
      </StageSection>

      <StageSection glow="purple" fromColor="rgba(6,182,212,0.03)" toColor="rgba(96,165,250,0.04)">
        <DeployTargets />
      </StageSection>

      <StageSection glow="cyan" fromColor="rgba(96,165,250,0.03)" toColor="rgba(6,182,212,0.04)">
        <ObservabilityDeck />
      </StageSection>

      <StageSection glow="emerald" fromColor="rgba(6,182,212,0.03)" toColor="rgba(52,211,153,0.04)">
        <BundleSharing />
      </StageSection>

      <StageSection glow="purple" fromColor="rgba(52,211,153,0.03)" toColor="rgba(168,85,247,0.04)">
        <DevToolsSuite />
      </StageSection>

      <StageSection glow="cyan" fromColor="rgba(168,85,247,0.03)" toColor="rgba(6,182,212,0.04)">
        <ConnectorGrid />
      </StageSection>
    </InfoPageLayout>
  );
}
