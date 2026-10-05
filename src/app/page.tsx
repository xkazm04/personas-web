import type { ComponentType } from "react";
import type { StageColor } from "@/lib/colors";
import { safeJsonLd } from "@/lib/seo";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import Hero from "@/components/sections/Hero";
import HeroAmbientIllustration from "@/components/sections/hero/HeroAmbientIllustration";
import Footer from "@/components/sections/Footer";
import {
  LazyCompanion,
  LazyDownloadCTA,
  LazyFAQ,
  LazyGetStarted,
  LazyOrchestrationHub,
  LazyPlaygroundSplit,
  LazyPricing,
  LazyTeamCanvas,
  LazyUseCases,
  LazyVision,
} from "@/components/sections/lazy";
import StageSection from "@/components/StageSection";
import LazyMount from "@/components/LazyMount";
import LandingHashArrival from "@/components/LandingHashArrival";
import { SCROLL_MAP_SECTIONS } from "@/lib/constants";
import { faqJsonLd, organizationJsonLd, softwareJsonLd } from "./homeJsonLd";

const scrollMapItems = SCROLL_MAP_SECTIONS.map((s) => ({
  label: s.label.toUpperCase(),
  href: `#${s.id}`,
}));

/** A stage section of the landing. `anchorId` is its declared address (see
 *  `lib/landing-address.ts`); `wrapperId` is the alias that external links and
 *  the guided tour still use. `gate` defers the chunk until the reader nears it. */
interface StageEntry {
  Component: ComponentType;
  glow: "cyan" | "purple" | "emerald";
  fromColor: StageColor;
  toColor?: StageColor;
  wrapperId?: string;
  anchorId: string;
  gate?: boolean;
}

const sections: StageEntry[] = [
  { Component: LazyUseCases,         glow: "emerald", fromColor: "cyan",    toColor: "emerald", wrapperId: "tools",       anchorId: "personas",    gate: true },
  { Component: LazyPlaygroundSplit,  glow: "cyan",    fromColor: "emerald", toColor: "cyan",    wrapperId: "playground",  anchorId: "concepts",    gate: true },
  { Component: LazyGetStarted,       glow: "emerald", fromColor: "cyan",    toColor: "emerald", anchorId: "get-started", gate: true },
  { Component: LazyOrchestrationHub, glow: "cyan",    fromColor: "emerald", toColor: "cyan",    wrapperId: "pipelines",   anchorId: "triggers",    gate: true },
  { Component: LazyTeamCanvas,       glow: "purple",  fromColor: "cyan",    toColor: "purple",  anchorId: "team-canvas", gate: true },
  { Component: LazyCompanion,        glow: "purple",  fromColor: "purple",  toColor: "purple",  anchorId: "companion",   gate: true },
  { Component: LazyVision,           glow: "purple",  fromColor: "purple",  toColor: "purple",  wrapperId: "vision",      anchorId: "private" },
  { Component: LazyPricing,          glow: "purple",  fromColor: "purple",  toColor: "purple",  wrapperId: "pricing",     anchorId: "pricing" },
  { Component: LazyFAQ,              glow: "cyan",    fromColor: "purple",  toColor: "cyan",    anchorId: "faq" },
  { Component: LazyDownloadCTA,      glow: "cyan",    fromColor: "cyan",                          wrapperId: "download-section", anchorId: "download", gate: true },
];

/* Drift guard: every scroll-map dot must have a stage that can receive it.
   `hero` is served by the always-present `<div id="hero">` below. */
if (process.env.NODE_ENV !== "production") {
  const covered = new Set(["hero", ...sections.map((s) => s.anchorId)]);
  const orphans = SCROLL_MAP_SECTIONS.filter((s) => !covered.has(s.id)).map((s) => s.id);
  if (orphans.length > 0) {
    console.warn("[home] scroll-map sections with no anchor on the page:", orphans);
  }
}

export default function Home() {
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
      <HeroAmbientIllustration />
      <PageShell scrollMapItems={scrollMapItems}>
        <div id="hero">
          <Hero />
        </div>
        {sections.map(({ Component, glow, fromColor, toColor, wrapperId, anchorId, gate }) => (
          <div key={anchorId} id={wrapperId} data-scroll-anchor={anchorId}>
            <StageSection glow={glow} fromColor={fromColor} toColor={toColor}>
              {gate ? (
                <LazyMount stage minHeight={640}>
                  <Component />
                </LazyMount>
              ) : (
                <Component />
              )}
            </StageSection>
          </div>
        ))}
      </PageShell>
      <Footer />
    </>
  );
}
