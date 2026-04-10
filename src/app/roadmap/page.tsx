import type { Metadata } from "next";
import Roadmap from "@/components/sections/Roadmap";
import FeatureVoting from "@/components/sections/FeatureVoting";
import Changelog from "@/components/sections/Changelog";
import StageSection from "@/components/StageSection";
import InfoPageLayout from "@/components/InfoPageLayout";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "See what's next for Personas. Explore the product roadmap, vote on upcoming features, and browse the changelog.",
  openGraph: {
    title: "Roadmap — Personas",
    description:
      "Product roadmap, feature voting, and changelog for Personas.",
    url: `${SITE_URL}/roadmap`,
  },
  alternates: {
    canonical: `${SITE_URL}/roadmap`,
  },
};

const scrollMapItems = [
  { label: "ROADMAP", href: "#roadmap" },
  { label: "VOTE", href: "#vote" },
  { label: "CHANGELOG", href: "#changelog" },
];

export default function RoadmapPage() {
  return (
    <InfoPageLayout scrollMapItems={scrollMapItems}>
      <StageSection glow="emerald" showTopLine={false} toColor="emerald">
        <Roadmap />
      </StageSection>

      <StageSection glow="purple" fromColor="emerald" toColor="purple">
        <FeatureVoting />
      </StageSection>

      <StageSection glow="cyan" fromColor="purple" toColor="cyan">
        <Changelog />
      </StageSection>
    </InfoPageLayout>
  );
}
