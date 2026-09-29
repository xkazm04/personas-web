import type { ComponentType } from "react";
import type { StageColor } from "@/lib/colors";
import { safeJsonLd } from "@/lib/seo";
import Navbar from "@/components/Navbar";
import LandingHero from "@/components/landing/hero";
import LandingSkinScope from "@/components/landing/LandingSkinScope";
import Footer from "@/components/sections/Footer";
import { LazyFAQ, LazyPricing } from "@/components/sections/lazy";
import {
  LazyRack,
  LazyConcepts,
  LazySetup,
  LazyRuns,
  LazyTriggers,
  LazyTeam,
  LazyCompanion,
  LazyNoCloud,
  LazyDownload,
} from "@/components/landing/lazy";
import StageSection from "@/components/StageSection";
import LazyMount from "@/components/LazyMount";
import PageShell from "@/components/PageShell";
import LandingHashArrival from "@/components/LandingHashArrival";
import { SCROLL_MAP_SECTIONS } from "@/lib/constants";
import { faqJsonLd, organizationJsonLd, softwareJsonLd } from "./homeJsonLd";

const scrollMapItems = SCROLL_MAP_SECTIONS.map((s) => ({
  label: s.label.toUpperCase(),
  href: `#${s.id}`,
}));

/** A ported landing section (skin-aware, `components/landing`). Its own root
 *  carries the address id; the always-present wrapper carries the legacy alias
 *  (`wrapperId`) that external links and the guided tour still use. */
interface LandingEntry {
  Component: ComponentType;
  anchorId: string;
  wrapperId?: string;
}

/** A site-styled stage section kept from the previous landing. */
interface StageEntry {
  Component: ComponentType;
  glow: "cyan" | "purple" | "emerald";
  fromColor: StageColor;
  toColor?: StageColor;
  wrapperId?: string;
  anchorId: string;
}

const landingSections: LandingEntry[] = [
  { Component: LazyRack,      anchorId: "personas",    wrapperId: "tools" },
  { Component: LazyConcepts,  anchorId: "concepts",    wrapperId: "playground" },
  { Component: LazySetup,     anchorId: "get-started" },
  { Component: LazyRuns,      anchorId: "runs" },
  { Component: LazyTriggers,  anchorId: "triggers",    wrapperId: "pipelines" },
  { Component: LazyTeam,      anchorId: "team-canvas" },
  { Component: LazyCompanion, anchorId: "companion" },
  { Component: LazyNoCloud,   anchorId: "private",     wrapperId: "vision" },
];

const stageSections: StageEntry[] = [
  { Component: LazyPricing, glow: "purple", fromColor: "purple", toColor: "purple", wrapperId: "pricing", anchorId: "pricing" },
  { Component: LazyFAQ,     glow: "cyan",   fromColor: "purple", toColor: "cyan",   anchorId: "faq" },
];

const downloadSection: LandingEntry = { Component: LazyDownload, anchorId: "download", wrapperId: "download-section" };

/* Drift guard: every scroll-map dot must have a stage that can receive it.
   `hero` is served by the always-present `<div id="hero">` below. */
if (process.env.NODE_ENV !== "production") {
  const covered = new Set(["hero", ...landingSections, ...stageSections, downloadSection].map((s) => (typeof s === "string" ? s : s.anchorId)));
  const orphans = SCROLL_MAP_SECTIONS.filter((s) => !covered.has(s.id)).map((s) => s.id);
  if (orphans.length > 0) {
    console.warn("[home] scroll-map sections with no anchor on the page:", orphans);
  }
}

export default function Home() {
  const renderLanding = ({ Component, anchorId, wrapperId }: LandingEntry) => (
    <div key={anchorId} id={wrapperId} data-scroll-anchor={anchorId}>
      <LazyMount minHeight={640}>
        <Component />
      </LazyMount>
    </div>
  );

  return (
    // No `SectionObserverProvider` here: `PageShell` mounts one for the same
    // ids, and every consumer (ScrollMap, MobilePageTOC, SectionBreadcrumb)
    // lives inside it. A second provider only duplicated the Intersection-
    // and MutationObserver over `document.body`'s whole subtree.
    <>
      <Navbar />
      {/* Lands /#download and every other declared address on its lazy section. */}
      <LandingHashArrival />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <PageShell scrollMapItems={scrollMapItems}>
        {/* The landing's own skin scope (footer switcher: Personas / Deck /
            Blueprint). Pricing and FAQ below keep the site's styling. */}
        <LandingSkinScope>
          <LandingHero />
          {landingSections.map(renderLanding)}
        </LandingSkinScope>

        {stageSections.map(({ Component, glow, fromColor, toColor, wrapperId, anchorId }) => (
          <div key={anchorId} id={wrapperId} data-scroll-anchor={anchorId}>
            <StageSection glow={glow} fromColor={fromColor} toColor={toColor}>
              <Component />
            </StageSection>
          </div>
        ))}

        <LandingSkinScope>{renderLanding(downloadSection)}</LandingSkinScope>
      </PageShell>
      <Footer />
    </>
  );
}
