"use client";

import { useMemo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import ScrollMap from "@/components/ScrollMap";
import AnimationPauseObserver from "@/components/AnimationPauseObserver";
import { SectionObserverProvider } from "@/contexts/SectionObserverContext";

const TopoBackground = dynamic(() => import("@/components/TopoBackground"), {
  ssr: false,
});
const ParallaxAccents = dynamic(() => import("@/components/ParallaxAccents"), {
  ssr: false,
});

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
      <main id="main-content" className="relative isolate overflow-hidden">
        <AnimationPauseObserver />
        <ScrollMap items={scrollMapItems} />
        {children}
      </main>
    </SectionObserverProvider>
  );
}
