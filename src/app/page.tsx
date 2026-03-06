import type { ComponentType } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Footer from "@/components/sections/Footer";
import {
  LazyAgentPlayground,
  LazyChangelog,
  LazyDownloadCTA,
  LazyFAQ,
  LazyPricing,
  LazyUseCases,
  LazyVision,
} from "@/components/sections/lazy";
import StageSection from "@/components/StageSection";
import SectionDivider from "@/components/SectionDivider";
import PageShell from "@/components/PageShell";
import { SectionObserverProvider } from "@/contexts/SectionObserverContext";

const scrollMapItems = [
  { label: "HERO", href: "#hero" },
  { label: "TOOLS", href: "#use-cases" },
  { label: "PLAYGROUND", href: "#playground" },
  { label: "VISION", href: "#vision" },
  { label: "PRICING", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "DOWNLOAD", href: "#download" },
];

const sectionIds = scrollMapItems.map((item) => item.href.replace("#", ""));

interface SectionConfig {
  Component: ComponentType;
  glow: "cyan" | "purple" | "emerald";
  fromColor: string;
  toColor?: string;
  dividerFrom: string;
  dividerTo: string;
  wrapperId?: string;
}

const sections: SectionConfig[] = [
  { Component: LazyUseCases,        glow: "emerald", fromColor: "rgba(6,182,212,0.03)",   toColor: "rgba(52,211,153,0.04)",  dividerFrom: "cyan",    dividerTo: "emerald" },
  { Component: LazyAgentPlayground, glow: "purple",  fromColor: "rgba(52,211,153,0.03)",  toColor: "rgba(168,85,247,0.03)",  dividerFrom: "emerald", dividerTo: "purple" },
  { Component: LazyVision,          glow: "purple",  fromColor: "rgba(52,211,153,0.03)",  toColor: "rgba(168,85,247,0.04)",  dividerFrom: "purple",  dividerTo: "purple", wrapperId: "vision" },
  { Component: LazyPricing,         glow: "purple",  fromColor: "rgba(52,211,153,0.03)",  toColor: "rgba(168,85,247,0.04)",  dividerFrom: "purple",  dividerTo: "purple" },
  { Component: LazyFAQ,             glow: "cyan",    fromColor: "rgba(168,85,247,0.03)",  toColor: "rgba(6,182,212,0.04)",   dividerFrom: "purple",  dividerTo: "cyan" },
  { Component: LazyDownloadCTA,     glow: "cyan",    fromColor: "rgba(6,182,212,0.03)",                                      dividerFrom: "cyan",    dividerTo: "cyan" },
];

export default function Home() {
  return (
    <SectionObserverProvider sectionIds={sectionIds}>
      <Navbar />
      <PageShell scrollMapItems={scrollMapItems}>

        <div id="hero">
          <Hero />
        </div>

        {sections.map(({ Component, glow, fromColor, toColor, dividerFrom, dividerTo, wrapperId }, i) => {
          const stage = (
            <StageSection key={i} glow={glow} fromColor={fromColor} toColor={toColor}>
              <Component />
            </StageSection>
          );

          return (
            <div key={i}>
              <SectionDivider from={dividerFrom} to={dividerTo} />
              {wrapperId ? <div id={wrapperId}>{stage}</div> : stage}
            </div>
          );
        })}

        <LazyChangelog />
      </PageShell>
      <Footer />
    </SectionObserverProvider>
  );
}
