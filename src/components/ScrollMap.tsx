"use client";

import { useEffect, useMemo, useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useActiveSectionId } from "@/contexts/SectionObserverContext";
import { useTranslation } from "@/i18n/useTranslation";
import { startArrival } from "@/hooks/useHashArrival";
import { resolveLandingAddress } from "@/lib/landing-address";
import type { ScrollMapItem } from "@/lib/types";

export default function ScrollMap({ items }: { items: ScrollMapItem[] }) {
  const { t } = useTranslation();
  const activeSectionId = useActiveSectionId();
  const reduced = useStillMotion();

  const activeIndex = useMemo(() => {
    const idx = items.findIndex((item) => item.href === `#${activeSectionId}`);
    return idx >= 0 ? idx : 0;
  }, [items, activeSectionId]);

  // Every scroll-map target is a declared home address, and most live inside
  // `ssr: false` + viewport-gated sections that are not in the DOM on first
  // paint. The shared arrival runner scrolls the always-present wrapper (which
  // mounts the section), then lands on the real section once it exists — the
  // same resolver and protocol a cold `/#download` link uses.
  const stopArrival = useRef<() => void>(() => {});
  useEffect(() => () => stopArrival.current(), []);

  const scrollTo = (href: string) => {
    const address = resolveLandingAddress(href);
    if (!address) return;
    stopArrival.current();
    const behavior: ScrollBehavior = reduced ? "instant" : "smooth";
    stopArrival.current = startArrival(address, { approach: behavior, land: () => behavior, focus: false });
  };

  return (
    <aside aria-label={t.pageNav.landmarkLabel} className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex flex-col items-end gap-2">
      <div className="rounded-full border border-glass bg-black/20 px-2.5 py-1 text-base uppercase tracking-[0.2em] text-muted-dark backdrop-blur-sm">
        {t.pageNav.scrollMap}
      </div>
      <div className="flex flex-col text-base font-mono tracking-wider">
        {items.map((item, i) => (
          <button
            key={item.href}
            onClick={() => scrollTo(item.href)}
            aria-current={i === activeIndex ? "true" : undefined}
            className={`pointer-events-auto flex h-11 -my-3.5 items-center justify-end gap-2 transition-[color,transform] duration-300 cursor-pointer focus-ring focus-visible:ring-offset-4 ${
              i === activeIndex
                ? "text-brand-cyan scale-105 font-bold"
                : "text-muted-dark hover:text-muted"
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`h-px transition-[width,background-color] duration-300 ${
                i === activeIndex
                  ? "w-6 bg-linear-to-l from-brand-cyan/80 to-transparent"
                  : "w-4 bg-linear-to-l from-brand-cyan/35 to-transparent"
              }`}
            />
          </button>
        ))}
      </div>
    </aside>
  );
}
