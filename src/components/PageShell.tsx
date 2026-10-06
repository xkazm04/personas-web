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
  snap = false,
  children,
}: {
  scrollMapItems: ScrollMapItem[];
  /** The page is built only of desktop stages (styles/stage.css): every
   *  scroll snaps to exactly one section. Leave off for a page with free-
   *  flowing content, which mandatory snapping would make unreachable. */
  snap?: boolean;
  children: ReactNode;
}) {
  const sectionIds = useMemo(
    () => scrollMapItems.map((item) => item.href.replace("#", "")),
    [scrollMapItems],
  );

  return (
    <SectionObserverProvider sectionIds={sectionIds}>
      <TourProvider>
        {/* overflow-clip, not -hidden: `hidden` makes <main> a scroll
            container, which captures every section's scroll-snap point
            (snap areas attach to their NEAREST scroll container) and left the
            viewport with nothing to snap to. `clip` paints the same. */}
        <main id="main-content" className="relative isolate overflow-clip scroll-mt-24" data-snap-page={snap ? "" : undefined}>
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
