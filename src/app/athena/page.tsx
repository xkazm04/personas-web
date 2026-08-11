"use client";

import InfoPageLayout from "@/components/InfoPageLayout";
import { useTranslation } from "@/i18n/useTranslation";
import {
  LazyAthenaHero,
  LazyOnboardingPartner,
  LazyFleetOrchestration,
  LazyHerWorkshop,
  LazyWholePortfolio,
  LazyLastingMemory,
  LazyOneMind,
} from "@/components/sections/athena-lazy";

/*
 * /athena — the page Athena earned once she outgrew a single homepage
 * section. Seven scenes, each a self-playing loop gated on being in view.
 *
 * Composition notes, so the next editor does not undo them:
 *
 * - No `StageSection` wrappers. Every other page uses them for their coloured
 *   glow stages and from/to gradient handoff; these sections each paint their
 *   own full-bleed stage (`AthenaStage` — void ground, one cyan key light, a
 *   circuit-dot grid), and the two backgrounds fight each other. The page's
 *   continuity comes from that shared stage instead.
 * - Anchors live on the wrappers below, never inside the sections. Each
 *   section is an `ssr: false` chunk, so its own ids are absent from the
 *   server HTML on first load; a deep link would find nothing to scroll to.
 *   The wrappers are always present, so /athena#memory works at first paint
 *   and after the chunk lands. Same reasoning as /how.
 * - Order is the argument: she introduces herself, sets your workspace up
 *   with you, turns a sentence into a working team, shows the machinery that
 *   answers to her, widens to the whole portfolio, grows over time, and
 *   closes by arriving back at one presence.
 */

export default function AthenaPage() {
  const { t } = useTranslation();
  const nav = t.athenaPage.nav;

  // Built inside the component because the labels are localized; the desktop
  // scroll-map rail and the mobile TOC both render them as visible text.
  const scrollMapItems = [
    { label: nav.meet, href: "#meet" },
    { label: nav.onboarding, href: "#onboarding" },
    { label: nav.fleet, href: "#fleet" },
    { label: nav.workshop, href: "#workshop" },
    { label: nav.portfolio, href: "#portfolio" },
    { label: nav.memory, href: "#memory" },
    { label: nav.oneMind, href: "#one-mind" },
  ];

  return (
    <InfoPageLayout scrollMapItems={scrollMapItems}>
      <div id="meet" className="scroll-mt-24">
        <LazyAthenaHero />
      </div>

      <div id="onboarding" className="scroll-mt-24">
        <LazyOnboardingPartner />
      </div>

      <div id="fleet" className="scroll-mt-24">
        <LazyFleetOrchestration />
      </div>

      <div id="workshop" className="scroll-mt-24">
        <LazyHerWorkshop />
      </div>

      <div id="portfolio" className="scroll-mt-24">
        <LazyWholePortfolio />
      </div>

      <div id="memory" className="scroll-mt-24">
        <LazyLastingMemory />
      </div>

      <div id="one-mind" className="scroll-mt-24">
        <LazyOneMind />
      </div>
    </InfoPageLayout>
  );
}
