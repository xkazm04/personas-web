"use client";

import { useState } from "react";
import {
  LazyEventBusShowcase,
  LazyAgentsTimeline,
  LazyAgentsChat,
  LazyPlatformLayers,
} from "@/components/sections/how-lazy";
import StageSection from "@/components/StageSection";
import HowRolePath, { type ViewerRole } from "@/components/sections/how-role-path";
import HowManifesto from "@/components/sections/how-manifesto";
import InfoPageLayout from "@/components/InfoPageLayout";
import type { StageColor } from "@/lib/colors";
import { howSectionsCopy } from "@/i18n/pending/howSections";

/* ── Glow colors per persona ── */

/** The opener glows in the chosen role's own colour. */
const openerGlow: Record<ViewerRole, "cyan" | "purple" | "emerald"> = {
  developer: "cyan",
  "product-manager": "purple",
  enterprise: "emerald",
};

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
  const nav = howSectionsCopy.scrollMap;
  const [role, setRole] = useState<ViewerRole>("developer");
  const glow = stageGlow[role];
  const colors = stageColors[role];

  // Built inside the component because the labels are localized; the desktop
  // scroll-map rail and the mobile TOC both render them as visible text.
  const scrollMapItems = [
    { label: nav.forYou, href: "#for-you" },
    { label: nav.timeline, href: "#agents-timeline" },
    { label: nav.chat, href: "#agents-chat" },
    { label: nav.layers, href: "#platform-layers" },
    { label: nav.manifesto, href: "#manifesto" },
    { label: nav.events, href: "#event-bus" },
  ];

  return (
    <InfoPageLayout scrollMapItems={scrollMapItems} snap>
      {/* Scroll-map / deep-link anchors live on the always-present StageSection
          wrappers, not the inner ids owned by the ssr:false lazy chunks (which
          are absent from the server HTML on first load). The browser scrolls to
          the first matching element — the wrapper — so /how#event-bus works at
          first paint and after the chunk mounts. */}
      {/* Start here: the visitor's role, and their path through the page */}
      <StageSection id="for-you" glow={openerGlow[role]} toColor="cyan">
        <HowRolePath role={role} onRoleChange={setRole} />
      </StageSection>

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

      {/* What stays yours */}
      <StageSection id="manifesto" glow="cyan" fromColor="purple" toColor={colors.evFrom}>
        <HowManifesto />
      </StageSection>

      <StageSection id="event-bus" glow={glow} fromColor={colors.evFrom} toColor={colors.evTo}>
        <LazyEventBusShowcase />
      </StageSection>
    </InfoPageLayout>
  );
}
