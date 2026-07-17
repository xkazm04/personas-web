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

/* ── Glow colors per persona ── */

const stageGlow: Record<ViewerRole, "cyan" | "purple" | "emerald"> = {
  developer: "cyan",
  "product-manager": "purple",
  enterprise: "cyan",
};

const stageColors: Record<ViewerRole, { evFrom: StageColor; evTo: StageColor }> = {
  developer: { evFrom: "emerald", evTo: "cyan" },
  "product-manager": { evFrom: "purple", evTo: "purple" },
  enterprise: { evFrom: "emerald", evTo: "cyan" },
};

export default function HowItWorks() {
  const [role, setRole] = useState<ViewerRole>("developer");
  const glow = stageGlow[role];
  const colors = stageColors[role];

  return (
    <InfoPageLayout scrollMapItems={scrollMapItems}>
      {/* Role selector */}
      <div className="relative z-10 flex flex-col items-center gap-3 pt-4 pb-2">
        <RoleSelector active={role} onChange={setRole} />
      </div>

      {/* Scroll-map / deep-link anchors live on the always-present StageSection
          wrappers, not the inner ids owned by the ssr:false lazy chunks (which
          are absent from the server HTML on first load). The browser scrolls to
          the first matching element — the wrapper — so /how#event-bus works at
          first paint and after the chunk mounts. */}
      {/* Agents */}
      <StageSection id="agents-timeline" glow="cyan" toColor="cyan">
        <LazyAgentsTimeline />
      </StageSection>

      <StageSection id="agents-chat" glow="emerald" fromColor="cyan" toColor="emerald">
        <LazyAgentsChat />
      </StageSection>

      {/* Platform */}
      <StageSection id="platform-layers" glow="purple" fromColor="emerald" toColor="purple">
        <LazyPlatformLayers />
      </StageSection>

      <CinematicBreather />

      <StageSection id="event-bus" glow={glow} fromColor={colors.evFrom} toColor={colors.evTo}>
        <LazyEventBusShowcase />
      </StageSection>
    </InfoPageLayout>
  );
}
