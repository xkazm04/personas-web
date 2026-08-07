import type { ComponentType } from "react";
import type { StageColor } from "@/lib/colors";
import { safeJsonLd } from "@/lib/seo";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import HeroAmbientIllustration from "@/components/sections/hero/HeroAmbientIllustration";
import Footer from "@/components/sections/Footer";
import {
  LazyDownloadCTA,
  LazyFAQ,
  LazyOrchestrationHub,
  LazyCompanion,
  LazyTeamCanvas,
  LazyPricing,
  LazyUseCases,
  LazyVision,
  LazyPlaygroundSplit,
  LazyGetStarted,
} from "@/components/sections/lazy";
import StageSection from "@/components/StageSection";
import SectionDivider from "@/components/SectionDivider";
import LazyMount from "@/components/LazyMount";
import PageShell from "@/components/PageShell";
import { SCROLL_MAP_SECTIONS } from "@/lib/constants";
import { faqJsonLd, organizationJsonLd, softwareJsonLd } from "./homeJsonLd";

const scrollMapItems = SCROLL_MAP_SECTIONS.map((s) => ({
  label: s.label.toUpperCase(),
  href: `#${s.id}`,
}));

interface SectionConfig {
  Component: ComponentType;
  glow: "cyan" | "purple" | "emerald";
  fromColor: StageColor;
  toColor?: StageColor;
  dividerFrom: StageColor;
  dividerTo: StageColor;
  wrapperId?: string;
  /** The `SCROLL_MAP_SECTIONS` id this stage hosts. Emitted as
   *  `data-scroll-anchor` on the stage's always-present wrapper so the scroll
   *  map can reach the section before it has mounted — several of these ids
   *  live inside `ssr: false` + gated components and are simply not in the DOM
   *  on first paint. Kept separate from `wrapperId` because the wrapper ids are
   *  external anchor targets (`#tools`, `#download-section`) that must not
   *  change, and because the mounted section renders the same id itself. */
  anchorId: string;
  /** Defer mount until ~1 viewport away. Set on ssr:false sections (which add
   *  nothing to SSR anyway) so their chunks load as you scroll, not all at once. */
  gate?: boolean;
}

const sections: SectionConfig[] = [
  { Component: LazyUseCases,           glow: "emerald", fromColor: "cyan",    toColor: "emerald", dividerFrom: "cyan",    dividerTo: "emerald", wrapperId: "tools", anchorId: "use-cases", gate: true },
  { Component: LazyPlaygroundSplit,    glow: "cyan",    fromColor: "emerald", toColor: "cyan",    dividerFrom: "emerald", dividerTo: "cyan", wrapperId: "playground", anchorId: "playground-split", gate: true },
  { Component: LazyGetStarted,         glow: "emerald", fromColor: "cyan",    toColor: "emerald", dividerFrom: "cyan",    dividerTo: "emerald", wrapperId: "get-started", anchorId: "get-started", gate: true },
  { Component: LazyOrchestrationHub,   glow: "cyan",    fromColor: "emerald", toColor: "cyan",    dividerFrom: "emerald", dividerTo: "cyan",    wrapperId: "pipelines", anchorId: "pipelines", gate: true },
  { Component: LazyTeamCanvas,         glow: "purple",  fromColor: "cyan",    toColor: "purple",  dividerFrom: "cyan",    dividerTo: "purple", anchorId: "team-canvas", gate: true },
  { Component: LazyCompanion,          glow: "purple",  fromColor: "purple",  toColor: "purple",  dividerFrom: "purple",  dividerTo: "purple", anchorId: "companion", gate: true },
  { Component: LazyVision,            glow: "purple",  fromColor: "purple",  toColor: "purple",  dividerFrom: "purple",  dividerTo: "purple", wrapperId: "vision", anchorId: "vision" },
  { Component: LazyPricing,           glow: "purple",  fromColor: "purple",  toColor: "purple",  dividerFrom: "purple",  dividerTo: "purple", wrapperId: "pricing", anchorId: "pricing" },
  { Component: LazyFAQ,               glow: "cyan",    fromColor: "purple",  toColor: "cyan",    dividerFrom: "purple",  dividerTo: "cyan", anchorId: "faq" },
  { Component: LazyDownloadCTA,        glow: "cyan",    fromColor: "cyan",                        dividerFrom: "cyan",    dividerTo: "cyan", wrapperId: "download-section", anchorId: "download", gate: true },
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
      {/* Decorative cinematic illustration — top-left ambient layer */}
      <HeroAmbientIllustration />
      <Navbar />
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

        <div id="hero">
          <Hero />
        </div>

        {sections.map(({ Component, glow, fromColor, toColor, dividerFrom, dividerTo, wrapperId, anchorId, gate }, i) => {
          const stage = (
            <StageSection key={i} glow={glow} fromColor={fromColor} toColor={toColor}>
              {gate ? (
                <LazyMount minHeight={640}>
                  <Component />
                </LazyMount>
              ) : (
                <Component />
              )}
            </StageSection>
          );

          return (
            <div key={i}>
              <SectionDivider from={dividerFrom} to={dividerTo} />
              <div id={wrapperId} data-scroll-anchor={anchorId}>
                {stage}
              </div>
            </div>
          );
        })}
      </PageShell>
      <Footer />
    </>
  );
}
