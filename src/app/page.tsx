import type { ComponentType } from "react";
import { safeJsonLd } from "@/lib/seo";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import HiveHero from "@/components/sections/hero-hive";
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
import { HOME_STAGES } from "@/lib/home-manifest";
import { faqJsonLd, organizationJsonLd, softwareJsonLd } from "./homeJsonLd";

const scrollMapItems = SCROLL_MAP_SECTIONS.map((s) => ({
  label: s.label.toUpperCase(),
  href: `#${s.id}`,
}));

/** Slug (see `lib/home-manifest.ts`) -> the lazy section it mounts. */
const COMPONENTS: Record<string, ComponentType> = {
  "use-cases": LazyUseCases,
  "playground-split": LazyPlaygroundSplit,
  "get-started": LazyGetStarted,
  "orchestration-hub": LazyOrchestrationHub,
  "team-canvas": LazyTeamCanvas,
  companion: LazyCompanion,
  vision: LazyVision,
  pricing: LazyPricing,
  faq: LazyFAQ,
  "download-cta": LazyDownloadCTA,
};

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
      <PageShell scrollMapItems={scrollMapItems} snap>
        <div id="hero">
          <HiveHero />
        </div>
        {HOME_STAGES.map(({ slug, glow, fromColor, toColor, wrapperId, anchorId, gate }) => {
          const Component = COMPONENTS[slug];
          return (
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
          );
        })}
      </PageShell>
      <Footer />
    </>
  );
}
