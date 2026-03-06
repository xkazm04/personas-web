"use client";

import { useState } from "react";
import {
  LazyEventBusShowcase,
  LazyFeatures,
  LazyWhyAgents,
} from "@/components/sections/how-lazy";
import StageSection from "@/components/StageSection";
import CinematicBreather from "@/components/CinematicBreather";
import InfoPageLayout from "@/components/InfoPageLayout";
import RoleSelector from "@/components/RoleSelector";
import type { ViewerRole } from "@/components/RoleSelector";

const scrollMapItems = [
  { label: "AGENTS", href: "#why-agents" },
  { label: "PLATFORM", href: "#features" },
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

      <StageSection glow={glows.hero} toColor={colors.heroTo}>
        <LazyWhyAgents role={role} />
      </StageSection>

      <StageSection glow={glows.features} fromColor={colors.featFrom} toColor={colors.featTo}>
        <LazyFeatures />
      </StageSection>

      <CinematicBreather />

      <StageSection glow={glows.events} fromColor={colors.evFrom} toColor={colors.evTo}>
        <LazyEventBusShowcase />
      </StageSection>
    </InfoPageLayout>
  );
}
