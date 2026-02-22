import type { ReactNode } from "react";
import ScrollMap from "@/components/ScrollMap";
import SectionSnapScroll from "@/components/SectionSnapScroll";
import TopoBackground from "@/components/TopoBackground";
import ParallaxAccents from "@/components/ParallaxAccents";
import AmbientOrbs from "@/components/AmbientOrbs";

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
    <main className="relative isolate overflow-hidden">
      <SectionSnapScroll />
      <TopoBackground />
      <ParallaxAccents />
      <AmbientOrbs />
      <ScrollMap items={scrollMapItems} />
      {children}
    </main>
  );
}
