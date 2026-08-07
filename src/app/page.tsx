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
import { SectionObserverProvider } from "@/contexts/SectionObserverContext";
import { faqJsonLd, organizationJsonLd, softwareJsonLd } from "./homeJsonLd";

const scrollMapItems = SCROLL_MAP_SECTIONS.map((s) => ({
  label: s.label.toUpperCase(),
  href: `#${s.id}`,
}));

const sectionIds = scrollMapItems.map((item) => item.href.replace("#", ""));

interface SectionConfig {
  Component: ComponentType;
  glow: "cyan" | "purple" | "emerald";
  fromColor: StageColor;
  toColor?: StageColor;
  dividerFrom: StageColor;
  dividerTo: StageColor;
  wrapperId?: string;
  /** Defer mount until ~1 viewport away. Set on ssr:false sections (which add
   *  nothing to SSR anyway) so their chunks load as you scroll, not all at once. */
  gate?: boolean;
}

const sections: SectionConfig[] = [
  { Component: LazyUseCases,           glow: "emerald", fromColor: "cyan",    toColor: "emerald", dividerFrom: "cyan",    dividerTo: "emerald", wrapperId: "tools", gate: true },
  { Component: LazyPlaygroundSplit,    glow: "cyan",    fromColor: "emerald", toColor: "cyan",    dividerFrom: "emerald", dividerTo: "cyan", wrapperId: "playground", gate: true },
  { Component: LazyGetStarted,         glow: "emerald", fromColor: "cyan",    toColor: "emerald", dividerFrom: "cyan",    dividerTo: "emerald", wrapperId: "get-started", gate: true },
  { Component: LazyOrchestrationHub,   glow: "cyan",    fromColor: "emerald", toColor: "cyan",    dividerFrom: "emerald", dividerTo: "cyan",    wrapperId: "pipelines", gate: true },
  { Component: LazyTeamCanvas,         glow: "purple",  fromColor: "cyan",    toColor: "purple",  dividerFrom: "cyan",    dividerTo: "purple", gate: true },
  { Component: LazyCompanion,          glow: "purple",  fromColor: "purple",  toColor: "purple",  dividerFrom: "purple",  dividerTo: "purple", gate: true },
  { Component: LazyVision,            glow: "purple",  fromColor: "purple",  toColor: "purple",  dividerFrom: "purple",  dividerTo: "purple", wrapperId: "vision" },
  { Component: LazyPricing,           glow: "purple",  fromColor: "purple",  toColor: "purple",  dividerFrom: "purple",  dividerTo: "purple", wrapperId: "pricing" },
  { Component: LazyFAQ,               glow: "cyan",    fromColor: "purple",  toColor: "cyan",    dividerFrom: "purple",  dividerTo: "cyan" },
  { Component: LazyDownloadCTA,        glow: "cyan",    fromColor: "cyan",                        dividerFrom: "cyan",    dividerTo: "cyan", wrapperId: "download-section", gate: true },
];

export default function Home() {
  return (
    <SectionObserverProvider sectionIds={sectionIds}>
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

        {sections.map(({ Component, glow, fromColor, toColor, dividerFrom, dividerTo, wrapperId, gate }, i) => {
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
              {wrapperId ? <div id={wrapperId}>{stage}</div> : stage}
            </div>
          );
        })}
      </PageShell>
      <Footer />
    </SectionObserverProvider>
  );
}
