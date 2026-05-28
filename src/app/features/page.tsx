import InfoPageLayout from "@/components/InfoPageLayout";
import StageSection from "@/components/StageSection";
import LazyMount from "@/components/LazyMount";

export const dynamic = "force-static";
export const revalidate = 3600;

import DesignEngine from "@/components/feature-sections/DesignEngine";
import {
  LazyMemoryLayers,
  LazyHealingCircuit,
  LazySecurityVault,
  LazyMultiProviderAI,
  LazyObservabilityDeck,
  LazyLab,
  LazyPlugins,
} from "@/components/feature-sections/feature-lazy";

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
      {/* First section stays eager (above the fold) for LCP + SEO. The rest are
          code-split + scroll-gated via LazyMount so their chunks load as the
          reader approaches, not all at once on first paint. The anchor id lives
          on the always-rendered StageSection so the scroll-map keeps working. */}
      <StageSection glow="purple" showTopLine={false} toColor="purple">
        <DesignEngine />
      </StageSection>

      <StageSection id="memory-layers" glow="purple" fromColor="purple" toColor="purple">
        <LazyMount minHeight={760} label="Memory">
          <LazyMemoryLayers />
        </LazyMount>
      </StageSection>

      <StageSection id="healing-circuit" glow="emerald" fromColor="purple" toColor="rose">
        <LazyMount minHeight={760} label="Healing">
          <LazyHealingCircuit />
        </LazyMount>
      </StageSection>

      <StageSection id="security" glow="emerald" fromColor="rose" toColor="rose">
        <LazyMount minHeight={760} label="Security">
          <LazySecurityVault />
        </LazyMount>
      </StageSection>

      <StageSection id="multi-provider" glow="cyan" fromColor="rose" toColor="cyan">
        <LazyMount minHeight={760} label="AI models">
          <LazyMultiProviderAI />
        </LazyMount>
      </StageSection>

      <StageSection id="observe" glow="emerald" fromColor="cyan" toColor="emerald">
        <LazyMount minHeight={820} label="Observe">
          <LazyObservabilityDeck />
        </LazyMount>
      </StageSection>

      <StageSection id="lab" glow="cyan" fromColor="emerald" toColor="cyan">
        <LazyMount minHeight={820} label="Lab">
          <LazyLab />
        </LazyMount>
      </StageSection>

      <StageSection id="plugins" glow="purple" fromColor="cyan" toColor="purple">
        <LazyMount minHeight={820} label="Plugins">
          <LazyPlugins />
        </LazyMount>
      </StageSection>
    </InfoPageLayout>
  );
}
