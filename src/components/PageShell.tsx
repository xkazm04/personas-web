"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import ScrollMap from "@/components/ScrollMap";
import AmbientOrbs from "@/components/AmbientOrbs";
import AnimationPauseObserver from "@/components/AnimationPauseObserver";

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
  return (
    <main id="main-content" className="relative isolate overflow-hidden">
      <AnimationPauseObserver />
      <TopoBackground />
      <ParallaxAccents />
      <AmbientOrbs />
      <ScrollMap items={scrollMapItems} />
      {children}
    </main>
  );
}
