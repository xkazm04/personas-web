"use client";

import { useMemo, type ReactNode } from "react";
import ScrollMap from "@/components/ScrollMap";
import AnimationPauseObserver from "@/components/AnimationPauseObserver";
import { ParticleHost } from "@/components/ParticleHost";
import { SectionObserverProvider } from "@/contexts/SectionObserverContext";
import { TourProvider } from "@/contexts/TourContext";
import TourOverlay from "@/components/tour/TourOverlay";

interface ScrollMapItem {
  label: string;
  href: string;
}

export default function PageShell({
  scrollMapItems,
  children,
}: {
  scrollMapItems: ScrollMapItem[];
  children: ReactNode;
}) {
  const sectionIds = useMemo(
    () => scrollMapItems.map((item) => item.href.replace("#", "")),
    [scrollMapItems],
  );

  return (
    <SectionObserverProvider sectionIds={sectionIds}>
      <TourProvider>
        <main id="main-content" className="relative isolate overflow-hidden scroll-mt-24">
          <AnimationPauseObserver />
          <ParticleHost />
          <ScrollMap items={scrollMapItems} />
          {children}
        </main>
        <TourOverlay />
      </TourProvider>
    </SectionObserverProvider>
  );
}
