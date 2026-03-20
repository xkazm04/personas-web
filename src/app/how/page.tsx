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

const stageColors: Record<ViewerRole, { heroTo: string; featFrom: string; featTo: string; evFrom: string; evTo: string }> = {
  developer: {
    heroTo: "rgba(244,63,94,0.04)",
    featFrom: "rgba(244,63,94,0.03)",
    featTo: "rgba(6,182,212,0.04)",
    evFrom: "rgba(52,211,153,0.03)",
    evTo: "rgba(6,182,212,0.04)",
  },
  "product-manager": {
    heroTo: "rgba(168,85,247,0.04)",
    featFrom: "rgba(168,85,247,0.03)",
    featTo: "rgba(168,85,247,0.04)",
    evFrom: "rgba(168,85,247,0.03)",
    evTo: "rgba(168,85,247,0.04)",
  },
  enterprise: {
    heroTo: "rgba(52,211,153,0.04)",
    featFrom: "rgba(52,211,153,0.03)",
    featTo: "rgba(52,211,153,0.04)",
    evFrom: "rgba(52,211,153,0.03)",
    evTo: "rgba(6,182,212,0.04)",
  },
};

export default function HowItWorks() {
  const [role, setRole] = useState<ViewerRole>("developer");
  const glows = stageGlows[role];
  const colors = stageColors[role];

  return (
    <InfoPageLayout scrollMapItems={scrollMapItems} breadcrumbItems={breadcrumbItems}>
      {/* Role selector */}
      <div className="relative z-10 flex justify-center pt-4 pb-2">
        <RoleSelector active={role} onChange={setRole} />
      </div>

      {/* Agents: 3 variants */}
      <StageSection glow={glows.hero} toColor={colors.heroTo}>
        <LazyWhyAgents role={role} />
      </StageSection>

      <StageSection glow="cyan" fromColor="rgba(244,63,94,0.03)" toColor="rgba(6,182,212,0.04)">
        <LazyAgentsTimeline />
      </StageSection>

      <StageSection glow="emerald" fromColor="rgba(6,182,212,0.03)" toColor="rgba(52,211,153,0.04)">
        <LazyAgentsChat />
      </StageSection>

      {/* Platform: 3 variants */}
      <StageSection glow={glows.features} fromColor={colors.featFrom} toColor={colors.featTo}>
        <LazyFeatures />
      </StageSection>

      <StageSection glow="purple" fromColor="rgba(6,182,212,0.03)" toColor="rgba(168,85,247,0.04)">
        <LazyPlatformLayers />
      </StageSection>

      <StageSection glow="cyan" fromColor="rgba(168,85,247,0.03)" toColor="rgba(6,182,212,0.04)">
        <LazyPlatformCommand />
      </StageSection>

      <CinematicBreather />

      <StageSection glow={glows.events} fromColor={colors.evFrom} toColor={colors.evTo}>
        <LazyEventBusShowcase />
      </StageSection>
    </InfoPageLayout>
  );
}
