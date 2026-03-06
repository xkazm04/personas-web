"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import ScrollMap from "@/components/ScrollMap";
import AmbientOrbs from "@/components/AmbientOrbs";
import { useAnimationPause } from "@/hooks/useAnimationPause";
import type { ScrollMapItem } from "@/lib/types";

const TopoBackground = dynamic(() => import("@/components/TopoBackground"), {
  ssr: false,
});
const ParallaxAccents = dynamic(() => import("@/components/ParallaxAccents"), {
  ssr: false,
});

export default function PageShell({
  scrollMapItems,
  children,
}: {
  scrollMapItems: ScrollMapItem[];
  children: ReactNode;
}) {
  useAnimationPause();

  return (
    <main id="main-content" aria-label="Landing page" className="relative isolate overflow-hidden">
      <TopoBackground />
      <ParallaxAccents />
      <AmbientOrbs />
      <ScrollMap items={scrollMapItems} />
      {children}
    </main>
  );
}
