"use client";

import { useState } from "react";
import {
  LazyEventBusShowcase,
  LazyAgentsTimeline,
  LazyAgentsChat,
  LazyPlatformLayers,
} from "@/components/sections/how-lazy";
import StageSection from "@/components/StageSection";
import CinematicBreather from "@/components/CinematicBreather";
import InfoPageLayout from "@/components/InfoPageLayout";
import RoleSelector from "@/components/RoleSelector";
import type { ViewerRole } from "@/components/RoleSelector";
import type { StageColor } from "@/lib/colors";

const scrollMapItems = [
  { label: "AGENTS: TIMELINE", href: "#agents-timeline" },
  { label: "AGENTS: CHAT", href: "#agents-chat" },
  { label: "PLATFORM: LAYERS", href: "#platform-layers" },
  { label: "EVENTS", href: "#event-bus" },
];

const breadcrumbItems = [
  { label: "AGENTS", href: "#agents-timeline", color: "#f43f5e" },
  { label: "PLATFORM", href: "#platform-layers", color: "#06b6d4" },
  { label: "EVENTS", href: "#event-bus", color: "#06b6d4" },
];

/* ── Glow colors per persona ── */

const stageGlows: Record<ViewerRole, { events: "cyan" | "purple" | "emerald" }> = {
  developer: { events: "cyan" },
  "product-manager": { events: "purple" },
  enterprise: { events: "cyan" },
};

const stageColors: Record<ViewerRole, { evFrom: StageColor; evTo: StageColor }> = {
  developer: { evFrom: "emerald", evTo: "cyan" },
  "product-manager": { evFrom: "purple", evTo: "purple" },
  enterprise: { evFrom: "emerald", evTo: "cyan" },
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

      {/* Agents */}
      <StageSection glow="cyan" toColor="cyan">
        <LazyAgentsTimeline />
      </StageSection>

      <StageSection glow="emerald" fromColor="cyan" toColor="emerald">
        <LazyAgentsChat />
      </StageSection>

      {/* Platform */}
      <StageSection glow="purple" fromColor="emerald" toColor="purple">
        <LazyPlatformLayers />
      </StageSection>

      <CinematicBreather />

      <StageSection glow={glows.events} fromColor={colors.evFrom} toColor={colors.evTo}>
        <LazyEventBusShowcase />
      </StageSection>
    </InfoPageLayout>
  );
}
