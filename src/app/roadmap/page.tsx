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
    "See what we're building and what's coming next. Follow our progress from local agent tools to cloud execution, team collaboration, and beyond.",
  openGraph: {
    title: "Roadmap — Personas",
    description:
      "See what we're building and what's coming next. Follow our progress from local agent tools to cloud execution, team collaboration, and beyond.",
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
