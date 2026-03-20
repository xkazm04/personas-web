"use client";

import { useState } from "react";
import {
  LazyEventBusShowcase,
  LazyFeatures,
  LazyWhyAgents,
  LazyAgentsTimeline,
  LazyAgentsChat,
  LazyPlatformLayers,
  LazyPlatformCommand,
} from "@/components/sections/how-lazy";
import StageSection from "@/components/StageSection";
import CinematicBreather from "@/components/CinematicBreather";
import InfoPageLayout from "@/components/InfoPageLayout";
import RoleSelector from "@/components/RoleSelector";
import type { ViewerRole } from "@/components/RoleSelector";
import type { StageColor } from "@/lib/colors";

const scrollMapItems = [
  { label: "AGENTS", href: "#why-agents" },
  { label: "AGENTS: TIMELINE", href: "#agents-timeline" },
  { label: "AGENTS: CHAT", href: "#agents-chat" },
  { label: "PLATFORM", href: "#features" },
  { label: "PLATFORM: LAYERS", href: "#platform-layers" },
  { label: "PLATFORM: CLI", href: "#platform-command" },
  { label: "EVENTS", href: "#event-bus" },
];

const breadcrumbItems = [
  { label: "AGENTS", href: "#why-agents", color: "#f43f5e" },
  { label: "PLATFORM", href: "#features", color: "#06b6d4" },
  { label: "EVENTS", href: "#event-bus", color: "#06b6d4" },
];

/* ── Glow colors per persona ── */

const stageGlows: Record<ViewerRole, { hero: "cyan" | "purple" | "emerald"; features: "cyan" | "purple" | "emerald"; events: "cyan" | "purple" | "emerald" }> = {
  developer: { hero: "purple", features: "cyan", events: "cyan" },
  "product-manager": { hero: "purple", features: "purple", events: "purple" },
  enterprise: { hero: "emerald", features: "emerald", events: "cyan" },
};

const stageColors: Record<ViewerRole, { heroTo: StageColor; featFrom: StageColor; featTo: StageColor; evFrom: StageColor; evTo: StageColor }> = {
  developer: {
    heroTo: "rose",
    featFrom: "rose",
    featTo: "cyan",
    evFrom: "emerald",
    evTo: "cyan",
  },
  "product-manager": {
    heroTo: "purple",
    featFrom: "purple",
    featTo: "purple",
    evFrom: "purple",
    evTo: "purple",
  },
  enterprise: {
    heroTo: "emerald",
    featFrom: "emerald",
    featTo: "emerald",
    evFrom: "emerald",
    evTo: "cyan",
  },
};

export default function HowItWorks() {
  const [role, setRole] = useState<ViewerRole>("developer");
  const glows = stageGlows[role];
  const colors = stageColors[role];

  return (
    <InfoPageLayout scrollMapItems={scrollMapItems} breadcrumbItems={breadcrumbItems}>
      {/* Role selector */}
      <div className="relative z-10 flex flex-col items-center gap-3 pt-4 pb-2">
        <RoleSelector active={role} onChange={setRole} />
      </div>

      {/* Agents: 3 variants */}
      <StageSection glow={glows.hero} toColor={colors.heroTo}>
        <LazyWhyAgents role={role} />
      </StageSection>

      <StageSection glow="cyan" fromColor="rose" toColor="cyan">
        <LazyAgentsTimeline />
      </StageSection>

      <StageSection glow="emerald" fromColor="cyan" toColor="emerald">
        <LazyAgentsChat />
      </StageSection>

      {/* Platform: 3 variants */}
      <StageSection glow={glows.features} fromColor={colors.featFrom} toColor={colors.featTo}>
        <LazyFeatures />
      </StageSection>

      <StageSection glow="purple" fromColor="cyan" toColor="purple">
        <LazyPlatformLayers />
      </StageSection>

      <StageSection glow="cyan" fromColor="purple" toColor="cyan">
        <LazyPlatformCommand />
      </StageSection>

      <CinematicBreather />

      <StageSection glow={glows.events} fromColor={colors.evFrom} toColor={colors.evTo}>
        <LazyEventBusShowcase />
      </StageSection>
    </InfoPageLayout>
  );
}
